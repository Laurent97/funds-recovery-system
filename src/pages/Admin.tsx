import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react";

interface RecoveryRequest {
  id: string;
  request_id: string;
  full_name: string;
  email: string;
  phone: string;
  platform: string;
  total_amount: number;
  fee_amount: number;
  net_amount: number;
  transaction_id: string;
  status: string;
  proof_file_url: string;
  payment_proof_url: string;
  id_upload_url: string;
  created_at: string;
}

const Admin = () => {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('recovery_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('recovery_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      toast({ title: "Success", description: `Request status updated to ${newStatus}` });
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'verified': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Kryvex TRADING - Admin Dashboard</h1>
        
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="bg-card/60 backdrop-blur-xl border-border shadow-2xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-foreground">{request.full_name}</CardTitle>
                    <p className="text-muted-foreground">{request.email}</p>
                    <p className="text-sm text-muted-foreground">Request ID: {request.request_id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(request.status)} text-white`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(request.status)}
                        <span>{request.status.toUpperCase()}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-muted-foreground text-sm">Platform</p>
                    <p className="text-foreground font-semibold">{request.platform}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Amount</p>
                    <p className="text-foreground font-semibold">{request.total_amount} USDT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Fee (20%)</p>
                    <p className="text-yellow-500 font-semibold">{request.fee_amount} USDT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Net Amount</p>
                    <p className="text-primary font-semibold">{request.net_amount} USDT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Transaction ID</p>
                    <p className="text-foreground font-semibold text-sm">{request.transaction_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Created</p>
                    <p className="text-foreground font-semibold text-sm">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {request.proof_file_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={request.proof_file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Proof File
                      </a>
                    </Button>
                  )}
                  {request.payment_proof_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={request.payment_proof_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Payment Proof
                      </a>
                    </Button>
                  )}
                  {request.id_upload_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={request.id_upload_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        ID Document
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(request.id, 'verified')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Mark Verified
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {request.status === 'verified' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(request.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recovery requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
