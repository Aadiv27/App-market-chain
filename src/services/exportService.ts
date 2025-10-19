import { ref, get } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

interface ExportData {
  users?: any[];
  orders?: any[];
  activities?: any[];
  kycPending?: any[];
}

class ExportService {
  // Convert data to CSV format
  private convertToCSV(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes in strings
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Download CSV file
  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Fetch all data from Firebase
  private async fetchAllData(): Promise<ExportData> {
    try {
      const [usersSnapshot, ordersSnapshot, activitiesSnapshot, kycSnapshot] = await Promise.all([
        get(ref(realtimeDb, 'users')),
        get(ref(realtimeDb, 'orders')),
        get(ref(realtimeDb, 'activityLogs')),
        get(ref(realtimeDb, 'kycPending'))
      ]);

      const data: ExportData = {};

      // Process users
      if (usersSnapshot.exists()) {
        data.users = Object.values(usersSnapshot.val()).map((user: any) => ({
          uid: user.uid,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          kycStatus: user.kycStatus || 'pending',
          isOnline: user.isOnline ? 'Yes' : 'No',
          createdAt: new Date(user.createdAt).toLocaleDateString(),
          lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '',
          businessName: user.businessName || '',
          address: user.address || ''
        }));
      }

      // Process orders
      if (ordersSnapshot.exists()) {
        const allOrders: any[] = [];
        const ordersData = ordersSnapshot.val();
        
        Object.keys(ordersData).forEach(role => {
          Object.keys(ordersData[role]).forEach(userId => {
            Object.values(ordersData[role][userId]).forEach((order: any) => {
              allOrders.push({
                id: order.id,
                userId: order.userId,
                userRole: order.userRole,
                userName: order.userName || '',
                status: order.status,
                total: order.total,
                itemCount: order.items ? order.items.length : 0,
                createdAt: new Date(order.createdAt).toLocaleDateString(),
                updatedAt: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '',
                assignedVehicle: order.assignedVehicle || '',
                deliveryAddress: order.deliveryAddress || '',
                paymentStatus: order.paymentStatus || 'pending'
              });
            });
          });
        });
        
        data.orders = allOrders;
      }

      // Process activities
      if (activitiesSnapshot.exists()) {
        const allActivities: any[] = [];
        const activitiesData = activitiesSnapshot.val();
        
        Object.keys(activitiesData).forEach(userId => {
          Object.values(activitiesData[userId]).forEach((activity: any) => {
            allActivities.push({
              id: activity.id,
              userId: activity.userId,
              userRole: activity.userRole,
              userName: activity.userName,
              action: activity.action,
              type: activity.type,
              timestamp: new Date(activity.timestamp).toLocaleDateString(),
              details: activity.details || ''
            });
          });
        });
        
        data.activities = allActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      // Process KYC pending
      if (kycSnapshot.exists()) {
        data.kycPending = Object.values(kycSnapshot.val()).map((kyc: any) => ({
          uid: kyc.uid,
          fullName: kyc.fullName,
          email: kyc.email,
          role: kyc.role,
          submittedAt: new Date(kyc.submittedAt).toLocaleDateString(),
          documents: kyc.documents ? kyc.documents.join(', ') : ''
        }));
      }

      return data;
    } catch (error) {
      console.error('Error fetching data for export:', error);
      throw new Error('Failed to fetch data for export');
    }
  }

  // Export users data
  async exportUsers(): Promise<void> {
    try {
      const data = await this.fetchAllData();
      
      if (!data.users || data.users.length === 0) {
        throw new Error('No users data available for export');
      }

      const headers = [
        'uid', 'fullName', 'email', 'phone', 'role', 'kycStatus', 
        'isOnline', 'createdAt', 'lastActive', 'businessName', 'address'
      ];
      
      const csvContent = this.convertToCSV(data.users, headers);
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  // Export orders data
  async exportOrders(): Promise<void> {
    try {
      const data = await this.fetchAllData();
      
      if (!data.orders || data.orders.length === 0) {
        throw new Error('No orders data available for export');
      }

      const headers = [
        'id', 'userId', 'userRole', 'userName', 'status', 'total', 
        'itemCount', 'createdAt', 'updatedAt', 'assignedVehicle', 
        'deliveryAddress', 'paymentStatus'
      ];
      
      const csvContent = this.convertToCSV(data.orders, headers);
      const filename = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  // Export activity logs
  async exportActivities(): Promise<void> {
    try {
      const data = await this.fetchAllData();
      
      if (!data.activities || data.activities.length === 0) {
        throw new Error('No activities data available for export');
      }

      const headers = [
        'id', 'userId', 'userRole', 'userName', 'action', 
        'type', 'timestamp', 'details'
      ];
      
      const csvContent = this.convertToCSV(data.activities, headers);
      const filename = `activities_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting activities:', error);
      throw error;
    }
  }

  // Export KYC pending data
  async exportKYCPending(): Promise<void> {
    try {
      const data = await this.fetchAllData();
      
      if (!data.kycPending || data.kycPending.length === 0) {
        throw new Error('No KYC pending data available for export');
      }

      const headers = [
        'uid', 'fullName', 'email', 'role', 'submittedAt', 'documents'
      ];
      
      const csvContent = this.convertToCSV(data.kycPending, headers);
      const filename = `kyc_pending_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting KYC pending:', error);
      throw error;
    }
  }

  // Export comprehensive report
  async exportComprehensiveReport(): Promise<void> {
    try {
      const data = await this.fetchAllData();
      
      // Create a summary report
      const summary = {
        exportDate: new Date().toLocaleDateString(),
        totalUsers: data.users?.length || 0,
        totalOrders: data.orders?.length || 0,
        totalActivities: data.activities?.length || 0,
        pendingKYC: data.kycPending?.length || 0,
        usersByRole: {},
        ordersByStatus: {},
        recentActivities: data.activities?.slice(0, 10) || []
      };

      // Calculate user distribution by role
      if (data.users) {
        data.users.forEach(user => {
          summary.usersByRole[user.role] = (summary.usersByRole[user.role] || 0) + 1;
        });
      }

      // Calculate order distribution by status
      if (data.orders) {
        data.orders.forEach(order => {
          summary.ordersByStatus[order.status] = (summary.ordersByStatus[order.status] || 0) + 1;
        });
      }

      const summaryHeaders = [
        'metric', 'value'
      ];
      
      const summaryData = [
        { metric: 'Export Date', value: summary.exportDate },
        { metric: 'Total Users', value: summary.totalUsers },
        { metric: 'Total Orders', value: summary.totalOrders },
        { metric: 'Total Activities', value: summary.totalActivities },
        { metric: 'Pending KYC', value: summary.pendingKYC },
        ...Object.entries(summary.usersByRole).map(([role, count]) => ({
          metric: `${role} Users`, value: count
        })),
        ...Object.entries(summary.ordersByStatus).map(([status, count]) => ({
          metric: `${status} Orders`, value: count
        }))
      ];
      
      const csvContent = this.convertToCSV(summaryData, summaryHeaders);
      const filename = `comprehensive_report_${new Date().toISOString().split('T')[0]}.csv`;
      
      this.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();