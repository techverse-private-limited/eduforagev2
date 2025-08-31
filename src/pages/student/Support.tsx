
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Plus } from 'lucide-react';
import { SupportTicketForm } from '@/components/SupportTicketForm';
import { SupportTicketsList } from '@/components/SupportTicketsList';

const Support = () => {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [refreshTickets, setRefreshTickets] = useState(0);

  const handleTicketSubmitted = () => {
    setRefreshTickets(prev => prev + 1);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-kontora font-black text-blue-dark mb-2">
          Support System
        </h2>
        <p className="text-blue-600 font-poppins text-sm lg:text-base">
          Get help and request assistance from tutors
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <HelpCircle className="w-5 h-5" />
              <span>Submit Support Request</span>
            </CardTitle>
            <Button
              onClick={() => setShowTicketForm(true)}
              style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}
              className="hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Raise Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Need help? Submit a support ticket and get assistance from our tutors:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Submit support queries with detailed descriptions</li>
              <li>Upload images for better context</li>
              <li>Get assigned to matching tutors automatically</li>
              <li>Track your query status in real-time</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets List */}
      <SupportTicketsList refreshTrigger={refreshTickets} />

      {/* Support Ticket Form Modal */}
      <SupportTicketForm
        open={showTicketForm}
        onOpenChange={setShowTicketForm}
        onTicketSubmitted={handleTicketSubmitted}
      />
    </div>
  );
};

export default Support;
