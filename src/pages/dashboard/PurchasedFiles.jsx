import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Icons } from "@/assets/icons";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";

export default function PurchasedFiles() {
  const { user } = useAuth();

  // Récupération des fichiers achetés par l'utilisateur
  const { data: purchasedFiles, isLoading } = useQuery({
    queryKey: ["/api/files/purchased"],
    queryFn: () => apiRequest("GET", "/api/files/purchased"),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-10">
            <Icons.loader className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!purchasedFiles || purchasedFiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="rounded-full bg-gray-100 p-4">
              <Icons.fileX className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">Aucun fichier acheté</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Vous n'avez pas encore acheté de fichier. <Link to="/">Parcourez les fichiers disponibles pour en acheter.</Link> 
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom du fichier</TableHead>
              <TableHead>Vendeur</TableHead>
              <TableHead>Code d'achat</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchasedFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
                  <a
                    href={`/file/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {file.title}
                  </a>
                </TableCell>
                <TableCell>{file.sellerName || "Inconnu"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-xs">
                    {file.purchaseCode || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={file.status === "completed" ? "success" : "destructive"}
                    className="uppercase text-xs"
                  >
                    {file.status === "completed" ? "Complété" : "En attente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={`/file/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Voir le détail
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}