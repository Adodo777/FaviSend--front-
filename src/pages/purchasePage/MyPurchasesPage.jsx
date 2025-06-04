import axios from "axios";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText, ImageIcon, Video, Music, Archive, Mail, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <ImageIcon className="h-6 w-6" />;
    if (fileType?.startsWith("video/")) return <Video className="h-6 w-6" />;
    if (fileType?.startsWith("audio/")) return <Music className="h-6 w-6" />;
    if (fileType?.includes("zip") || fileType?.includes("rar")) return <Archive className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
};

export default function MyPurchasesPage() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [accessToken, setAccessToken] = useState(null);
    const [email, setEmail] = useState(null);

    // Vérifier le token d'accès et l'email dans localStorage
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedEmail = localStorage.getItem("userEmail");

        if (!token) {
            navigate("/email-verification");
            return;
        }

        setAccessToken(token);
        setEmail(storedEmail);
    }, [navigate]);

    const {
        data: purchases,
        isLoading,
        error,
    } = useQuery({
        queryKey: [`/api/purchase/list`, email],
        queryFn: async () => {
            try {
                const response = await axios.post(
                    "https://backend-favisend.onrender.com/api/purchase/list",
                    { email }, // Envoyer l'email dans le corps de la requête
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                return response.data;
            } catch (err) {
                throw new Error(err.response?.data?.message || "Erreur lors de la récupération des achats.");
            }
        },
        enabled: !!accessToken && !!email,
    });

    const downloadFile = (downloadUrl, fileName) => {
        // Lancer le téléchargement du fichier directement
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", fileName || "file"); // Utiliser le nom du fichier ou un nom par défaut
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        navigate("/email-verification");
    };

    if (!accessToken) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <CardTitle>Chargement de vos achats...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-800">Erreur d'accès</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-gray-700">
                            Impossible de charger vos achats. Votre session a peut-être expiré.
                        </p>
                        <Button onClick={handleLogout} className="w-full">
                            Se reconnecter
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Mes Achats</h1>
                        </div>
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            <LogOut className="h-4 w-4 mr-2" />
                            Se déconnecter
                        </Button>
                    </div>

                    <Alert className="border-green-200 bg-green-50">
                        <Mail className="h-4 w-4" />
                        <AlertDescription className="text-green-800">
                            Connecté en tant que <strong>{email}</strong> - Vous pouvez télécharger tous vos fichiers achetés
                        </AlertDescription>
                    </Alert>
                </div>

                {!purchases || purchases.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun achat trouvé</h3>
                            <p className="text-gray-600">
                                Vous n'avez encore effectué aucun achat ou vos achats ne sont pas liés à cette adresse email.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {purchases.map((purchase) => (
                            <Card key={purchase.id} className="overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(purchase.file.fileType)}
                                            <div>
                                                <CardTitle className="text-lg">{purchase.file.title}</CardTitle>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Acheté le {new Date(purchase.purchaseDate).toLocaleDateString("fr-FR")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600">{purchase.price} CFA</p>
                                            <p className="text-sm text-gray-600">{purchase.file.fileSize}</p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {purchase.file.description && (
                                        <p className="text-gray-700">{purchase.file.description}</p>
                                    )}

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Créateur:</span>
                                            <span className="font-medium">
                                                {purchase.file.user.displayName || purchase.file.user.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">ID de commande:</span>
                                            <span className="text-sm font-mono">{purchase.orderId}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => downloadFile(purchase.downloadUrl, purchase.file.title)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                    >
                                        <Download className="h-5 w-5 mr-2" />
                                        Télécharger le fichier
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}