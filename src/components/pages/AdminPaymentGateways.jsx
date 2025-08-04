import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { paymentGatewayService } from "@/services/api/paymentGatewayService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const AdminPaymentGateways = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accountHolderName: "",
    accountNumber: "",
    gatewayType: "Bank Account",
    logoUrl: "",
    isActive: true
  });

  const loadGateways = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await paymentGatewayService.getAll();
      setGateways(data);
    } catch (err) {
      setError("Failed to load payment gateways");
      console.error("Failed to load gateways:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.accountHolderName || !formData.accountNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingGateway) {
        await paymentGatewayService.update(editingGateway.Id, formData);
        toast.success("Payment gateway updated successfully!");
      } else {
        await paymentGatewayService.create(formData);
        toast.success("Payment gateway added successfully!");
      }
      
      setShowModal(false);
      setEditingGateway(null);
      setFormData({
        name: "",
        accountHolderName: "",
        accountNumber: "",
        gatewayType: "Bank Account",
        logoUrl: "",
        isActive: true
      });
      loadGateways();
    } catch (err) {
      toast.error(editingGateway ? "Failed to update gateway" : "Failed to add gateway");
      console.error("Failed to save gateway:", err);
    }
  };

  const handleEdit = (gateway) => {
    setEditingGateway(gateway);
    setFormData({
      name: gateway.name,
      accountHolderName: gateway.accountHolderName,
      accountNumber: gateway.accountNumber,
      gatewayType: gateway.gatewayType,
      logoUrl: gateway.logoUrl || "",
      isActive: gateway.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (gateway) => {
    if (!window.confirm(`Are you sure you want to delete ${gateway.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await paymentGatewayService.delete(gateway.Id);
      toast.success("Payment gateway deleted successfully!");
      loadGateways();
    } catch (err) {
      toast.error(err.message || "Failed to delete gateway");
      console.error("Failed to delete gateway:", err);
    }
  };

  const handleToggleStatus = async (gateway) => {
    try {
      await paymentGatewayService.toggleStatus(gateway.Id);
      toast.success(`Gateway ${gateway.isActive ? 'deactivated' : 'activated'} successfully!`);
      loadGateways();
    } catch (err) {
      toast.error("Failed to update gateway status");
      console.error("Failed to toggle status:", err);
    }
  };

  const copyAccountNumber = (accountNumber) => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Account number copied to clipboard!");
  };

  const filteredGateways = gateways.filter(gateway =>
    gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gateway.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gateway.gatewayType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadGateways} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Payment Gateways
              </h1>
              <p className="text-gray-600">Manage payment methods and gateway configurations</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Gateway
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search gateways..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Gateways Table */}
        <div className="bg-white rounded-xl shadow-premium overflow-hidden">
          {filteredGateways.length === 0 ? (
            <div className="p-6">
              <Empty
                title="No payment gateways found"
                description={searchTerm ? "No gateways match your search criteria." : "Add your first payment gateway to get started."}
                actionLabel="Add Gateway"
                onAction={() => setShowModal(true)}
                icon="CreditCard"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Gateway</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Account Details</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGateways.map((gateway) => (
                    <tr key={gateway.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={gateway.logoUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=50&h=50&fit=crop"}
                            alt={gateway.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{gateway.name}</p>
                            <p className="text-sm text-gray-600">{gateway.accountHolderName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{gateway.accountNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAccountNumber(gateway.accountNumber)}
                            className="p-1"
                          >
                            <ApperIcon name="Copy" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" size="sm">
                          {gateway.gatewayType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(gateway)}
                          className="flex items-center gap-2"
                        >
                          <Badge variant={gateway.isActive ? "success" : "secondary"}>
                            <ApperIcon 
                              name={gateway.isActive ? "CheckCircle" : "XCircle"} 
                              className="w-3 h-3 mr-1"
                            />
                            {gateway.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(gateway)}
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(gateway)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center mb-4">
                      <ApperIcon name="CreditCard" className="w-6 h-6 text-primary-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingGateway ? "Edit Payment Gateway" : "Add Payment Gateway"}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gateway Name *
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g., HBL, JazzCash, EasyPaisa"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name *
                        </label>
                        <Input
                          type="text"
                          value={formData.accountHolderName}
                          onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                          placeholder="Account holder name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number *
                        </label>
                        <Input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                          placeholder="Full account number"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gateway Type
                        </label>
                        <select
                          value={formData.gatewayType}
                          onChange={(e) => handleInputChange("gatewayType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Bank Account">Bank Account</option>
                          <option value="Mobile Wallet">Mobile Wallet</option>
                          <option value="Digital Payment">Digital Payment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo URL (Optional)
                        </label>
                        <Input
                          type="text"
                          value={formData.logoUrl}
                          onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange("isActive", e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                          Gateway is active
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <Button type="submit" variant="primary" className="sm:ml-3">
                      {editingGateway ? "Update Gateway" : "Add Gateway"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setEditingGateway(null);
                        setFormData({
                          name: "",
                          accountHolderName: "",
                          accountNumber: "",
                          gatewayType: "Bank Account",
                          logoUrl: "",
                          isActive: true
                        });
                      }}
                      className="mt-3 sm:mt-0"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentGateways;