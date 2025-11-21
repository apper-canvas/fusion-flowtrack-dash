import { useState, useRef, useEffect, useMemo } from 'react';

const ApperFileFieldComponent = ({ config, elementId }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles || [];
    // Check if files have actually changed by comparing length and first file's ID/id
    if (files.length !== existingFilesRef.current.length) {
      return files;
    }
    if (files.length > 0 && existingFilesRef.current.length > 0) {
      const currentFirstId = files[0]?.Id || files[0]?.id;
      const previousFirstId = existingFilesRef.current[0]?.Id || existingFilesRef.current[0]?.id;
      if (currentFirstId !== previousFirstId) {
        return files;
      }
    }
    return existingFilesRef.current;
  }, [config.existingFiles]);

  // Initial Mount Effect
  useEffect(() => {
    const initializeFileField = async () => {
      try {
        // Wait for ApperSDK to load - 50 attempts × 100ms = 5 seconds timeout
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        
        if (!ApperFileUploader || !ApperFileUploader.FileField) {
          throw new Error('ApperFileUploader not available in ApperSDK.');
        }

        // Set unique element ID
        elementIdRef.current = `file-uploader-${elementId}`;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        mountedRef.current = true;
        existingFilesRef.current = memoizedExistingFiles;
        setIsReady(true);
        setError(null);
        
      } catch (err) {
        setError(`Mount error: ${err.message}`);
        setIsReady(false);
        console.error('ApperFileFieldComponent mount error:', err);
      }
    };

    initializeFileField();

    // Cleanup on component destruction
    return () => {
      try {
        if (window.ApperSDK?.ApperFileUploader?.FileField && mountedRef.current) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        existingFilesRef.current = [];
      } catch (err) {
        console.error('ApperFileFieldComponent unmount error:', err);
      }
    };
  }, [elementId, config.fieldKey, config.tableName, config.apperProjectId, config.apperPublicKey]);

  // File Update Effect
  useEffect(() => {
    const updateFiles = async () => {
      // Early returns for safety checks
      if (!isReady || !window.ApperSDK?.ApperFileUploader?.FileField || !config.fieldKey) {
        return;
      }

      try {
        // Deep equality check to avoid unnecessary updates
        const currentFilesStr = JSON.stringify(memoizedExistingFiles);
        const previousFilesStr = JSON.stringify(existingFilesRef.current);
        
        if (currentFilesStr === previousFilesStr) {
          return;
        }

        const { ApperFileUploader } = window.ApperSDK;
        
        // Format detection and conversion
        let filesToUpdate = memoizedExistingFiles;
        
        // Check if format conversion is needed (API format has .Id, UI format has .id)
        if (filesToUpdate.length > 0 && filesToUpdate[0]?.Id) {
          filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
        }
        
        // Update files or clear field based on content
        if (filesToUpdate.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = memoizedExistingFiles;
        
      } catch (err) {
        setError(`Update error: ${err.message}`);
        console.error('ApperFileFieldComponent update error:', err);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-error-200 bg-error-50 rounded-lg">
        <p className="text-error-600 text-sm font-medium">File Upload Error</p>
        <p className="text-error-500 text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main container with unique ID */}
      <div id={elementIdRef.current} className="w-full min-h-[100px] border-2 border-dashed border-slate-300 rounded-lg">
        {/* Loading UI */}
        {!isReady && (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-slate-500 text-sm">Initializing file upload...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;