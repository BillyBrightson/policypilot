"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getTrainerProfiles, createTrainerBooking } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import type { TrainerProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedLayout from "@/components/protected-layout";
import { Users, Star, MapPin, Mail, Calendar, MessageSquare } from "lucide-react";

export default function TrainersPage() {
  const router = useRouter();
  const { user, tenant, loading: authLoading } = useAuth();
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [booking, setBooking] = useState({
    topic: "",
    preferredDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      loadTrainers();
    }
  }, [authLoading]);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const trainersList = await getTrainerProfiles(true);
      setTrainers(trainersList);
    } catch (error) {
      console.error("Error loading trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingDialog = (trainer: TrainerProfile) => {
    setSelectedTrainer(trainer);
    setBooking({
      topic: trainer.specialization,
      preferredDate: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedTrainer || !user || !tenant || !booking.topic) {
      toast({
        variant: "warning",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createTrainerBooking({
        tenantId: tenant.id,
        trainerId: selectedTrainer.id,
        requestedByUserId: user.uid,
        status: "pending",
        topic: booking.topic,
        preferredDate: booking.preferredDate || null,
        notes: booking.notes || null,
      });

      setDialogOpen(false);
      setSelectedTrainer(null);
      setBooking({ topic: "", preferredDate: "", notes: "" });
      
      toast({
        variant: "success",
        title: "Success",
        description: "Training session requested successfully!",
      });
      
      // Redirect to bookings page
      router.push("/trainers/bookings");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trainers...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trainer Marketplace</h1>
          <p className="text-muted-foreground">
            Connect with certified compliance trainers and consultants
          </p>
        </div>

        {trainers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Trainers Available</h3>
                <p className="text-sm text-muted-foreground">
                  Trainers will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{trainer.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{trainer.name}</CardTitle>
                  <CardDescription className="font-medium">{trainer.specialization}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{trainer.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{trainer.contactEmail}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{trainer.bio}</p>
                  <Button
                    className="w-full"
                    onClick={() => handleOpenBookingDialog(trainer)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Request Training
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Training Session</DialogTitle>
              <DialogDescription>
                Request a training session with {selectedTrainer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Training Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Data Protection Compliance"
                  value={booking.topic}
                  onChange={(e) => setBooking({ ...booking, topic: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date (Optional)</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={booking.preferredDate}
                  onChange={(e) => setBooking({ ...booking, preferredDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any specific requirements or questions..."
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBooking} disabled={!booking.topic || submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  );
}

