import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const TABLE_NAME = 'task_c';

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}}
        ],
        orderBy: [{"fieldName": "createdAt_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      // Only include updateable fields
      const createData = {
        title_c: taskData.title || taskData.title_c,
        description_c: taskData.description || taskData.description_c,
        priority_c: taskData.priority || taskData.priority_c,
        status_c: taskData.status || taskData.status_c,
        createdAt_c: taskData.createdAt || taskData.createdAt_c || new Date().toISOString(),
        completedAt_c: taskData.completedAt || taskData.completedAt_c
      };

      // Remove empty fields
      Object.keys(createData).forEach(key => {
        if (createData[key] === undefined || createData[key] === null || createData[key] === '') {
          delete createData[key];
        }
      });

      const params = {
        records: [createData]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("No records created");
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      // Map old field names to new ones
      const updateData = {
        Id: parseInt(id),
        ...(updates.title !== undefined && { title_c: updates.title }),
        ...(updates.description !== undefined && { description_c: updates.description }),
        ...(updates.priority !== undefined && { priority_c: updates.priority }),
        ...(updates.status !== undefined && { status_c: updates.status }),
        ...(updates.createdAt !== undefined && { createdAt_c: updates.createdAt }),
        ...(updates.completedAt !== undefined && { completedAt_c: updates.completedAt }),
        // Handle direct field name updates
        ...(updates.title_c !== undefined && { title_c: updates.title_c }),
        ...(updates.description_c !== undefined && { description_c: updates.description_c }),
        ...(updates.priority_c !== undefined && { priority_c: updates.priority_c }),
        ...(updates.status_c !== undefined && { status_c: updates.status_c }),
        ...(updates.createdAt_c !== undefined && { createdAt_c: updates.createdAt_c }),
        ...(updates.completedAt_c !== undefined && { completedAt_c: updates.completedAt_c })
      };

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("No records updated");
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  }
};