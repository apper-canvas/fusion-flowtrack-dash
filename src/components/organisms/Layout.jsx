import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Layout = () => {
  const { user } = useSelector(state => state.user)
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {user && (
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <h1 className="text-xl font-semibold text-slate-800">FlowTrack</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Welcome, {user.firstName || user.emailAddress}
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-800"
                >
                  <ApperIcon name="LogOut" size={16} className="mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      <Outlet />
    </div>
  )
}

export default Layout