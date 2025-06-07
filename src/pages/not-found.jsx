import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Oops! Page Introuvable</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Assurez-vous que l'URL est correcte ou retournez à la page d'accueil.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition"
            >
              Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
