"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getTrainerBookingsByTenant, getTrainerProfile } from "@/lib/db";
import type { TrainerBooking, TrainerProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedLayout from "@/components/protected-layout";
import { Calendar, Users, MessageSquare, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export default function TrainerBookingsPage() {
  const router = useRouter();
  const { tenant, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [trainerProfiles, setTrainerProfiles] = useState<Record<string, TrainerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && tenant) {
      loadBookings();
    }
  }, [tenant, authLoading]);

  const loadBookings = async () => {
    if (!tenant) return;

    try {
      setLoading(true);
      const bookingsList = await getTrainerBookingsByTenant(tenant.id);
      setBookings(bookingsList);

      // Load trainer profiles
      const profiles: Record<string, TrainerProfile> = {};
      for (const booking of bookingsList) {
        if (!profiles[booking.trainerId]) {
          const trainer = await getTrainerProfile(booking.trainerId);
          if (trainer) {
            profiles[booking.trainerId] = trainer;
          }
        }
      }
      setTrainerProfiles(profiles);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-green-200 text-green-700";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => statusFilter === "all" || booking.status === statusFilter
  );

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trainer Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your training session requests
            </p>
          </div>
          <Button onClick={() => router.push("/trainers")}>
            <Calendar className="mr-2 h-4 w-4" />
            Request New Training
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {bookings.length === 0
                    ? "Request a training session to get started"
                    : "No bookings match the selected filter"}
                </p>
                {bookings.length === 0 && (
                  <Button onClick={() => router.push("/trainers")}>
                    Browse Trainers
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const trainer = trainerProfiles[booking.trainerId];

              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {getStatusIcon(booking.status)}
                          <span>{booking.topic}</span>
                        </CardTitle>
                        <CardDescription>
                          {trainer ? `Trainer: ${trainer.name}` : "Trainer: Loading..."}
                          {trainer && ` • ${trainer.specialization}`}
                        </CardDescription>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {booking.preferredDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Preferred Date:</span>
                          <span>{new Date(booking.preferredDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Requested:</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}



