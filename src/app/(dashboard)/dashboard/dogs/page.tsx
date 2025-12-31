"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Dog, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DogProfile {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  weight: number | null;
  gender: string | null;
  isNeutered: boolean;
  color: string | null;
  trainingLevel: string;
  temperament: string | null;
  goodWithOtherDogs: boolean;
  goodWithChildren: boolean;
}

export default function DogsPage() {
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = async () => {
    try {
      const response = await fetch("/api/dogs");
      const data = await response.json();
      if (response.ok) {
        setDogs(data.dogs);
      } else {
        setError(data.error || "Failed to load dogs");
      }
    } catch {
      setError("Failed to load dogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  const handleDelete = async (dogId: string) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDogs(dogs.filter((dog) => dog.id !== dogId));
      }
    } catch {
      setError("Failed to delete dog");
    }
  };

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "Unknown";
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    if (years < 1) {
      const totalMonths = years * 12 + months;
      return `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
    }
    return `${years} year${years !== 1 ? "s" : ""}`;
  };

  const getTrainingBadgeVariant = (level: string) => {
    switch (level) {
      case "ADVANCED":
        return "default";
      case "INTERMEDIATE":
        return "secondary";
      case "BASIC":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dogs</h1>
          <p className="text-muted-foreground">
            Manage your dog profiles for booking services
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/dogs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Dog
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {dogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dog className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No dogs yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first dog to start booking training sessions
            </p>
            <Button asChild>
              <Link href="/dashboard/dogs/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Dog
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <Card key={dog.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Dog className="h-5 w-5" />
                      {dog.name}
                    </CardTitle>
                    <CardDescription>
                      {dog.breed || "Mixed breed"} {dog.gender ? `• ${dog.gender === "MALE" ? "Male" : "Female"}` : ""}
                    </CardDescription>
                  </div>
                  <Badge variant={getTrainingBadgeVariant(dog.trainingLevel)}>
                    {dog.trainingLevel.toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>{calculateAge(dog.birthDate)}</span>
                  </div>
                  {dog.weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{dog.weight} lbs</span>
                    </div>
                  )}
                  {dog.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{dog.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Neutered/Spayed:</span>
                    <span>{dog.isNeutered ? "Yes" : "No"}</span>
                  </div>
                  {dog.temperament && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperament:</span>
                      <span className="truncate max-w-[150px]">{dog.temperament}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {dog.goodWithOtherDogs && (
                      <Badge variant="outline" className="text-xs">Good with dogs</Badge>
                    )}
                    {dog.goodWithChildren && (
                      <Badge variant="outline" className="text-xs">Good with kids</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/dogs/${dog.id}/edit`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {dog.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {dog.name} from your profile. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(dog.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
