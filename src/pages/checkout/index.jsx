import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, ImageIcon, Video, Music, Archive, ArrowLeft, CreditCard, User, UserX } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getFileIcon = (fileType) => {
  if (fileType.startsWith("image/")) return <ImageIcon className="h-8 w-8" />;
  if (fileType.startsWith("video/")) return <Video className="h-8 w-8" />;
  if (fileType.startsWith("audio/")) return <Music className="h-8 w-8" />;
  if (fileType.includes("zip") || fileType.includes("rar")) return <Archive className="h-8 w-8" />;
  return <FileText className="h-8 w-8" />;
};

const countries = [
  "Burkina Faso",
  "Côte d'Ivoire",
  "Mali",
  "Niger",
  "Sénégal",
  "Bénin",
  "Togo",
  "Guinée",
  "Cameroun",
  "Tchad",
  "Gabon",
  "République centrafricaine",
  "Congo",
  "République démocratique du Congo",
];

// Validation des champs
const validateForm = (values) => {
  const errors = {};

  if (!values.firstName || values.firstName.length < 2) {
    errors.firstName = "Le prénom doit contenir au moins 2 caractères";
  }

  if (!values.lastName || values.lastName.length < 2) {
    errors.lastName = "Le nom doit contenir au moins 2 caractères";
  }

  if (!values.phoneNumber || values.phoneNumber.length < 8) {
    errors.phoneNumber = "Le numéro de téléphone doit contenir au moins 8 chiffres";
  }

  if (!values.country) {
    errors.country = "Veuillez sélectionner un pays";
  }

  if (!values.city || values.city.length < 2) {
    errors.city = "La ville doit contenir au moins 2 caractères";
  }

  return errors;
};

export default function CheckoutPage() {
  const [, params] = useRoute("/checkout/:fileId");
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Récupérer l'ID du fichier depuis l'URL
  const fileId = params?.fileId;

  // Vérifier s'il y a un paymentId dans l'URL et rediriger vers la page de vérification
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentIdFromUrl = searchParams.get("paymentId");

    if (paymentIdFromUrl) {
      // Rediriger vers la page de vérification de paiement
      navigate(`/payment-verification?paymentId=${paymentIdFromUrl}`);
    }
  }, [navigate]);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      country: "",
      city: "",
      email: "",
    },
  });

  // Pré-remplir le formulaire si l'utilisateur est connecté
  useEffect(() => {
    if (user && !authLoading) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        city: user.city || "",
      });
    }
  }, [user, authLoading]);

  const {
    data,
    isLoading: fileLoading,
    error,
  } = useQuery({
    queryKey: [`/api/files/detail/${fileId}`],
    enabled: !!fileId,
  });

  const file = data;

  const paymentMutation = useMutation({
    mutationFn: async (values) => {
      const response = await apiRequest("POST", "/api/purchase/init", {
        fileId: fileId,
        ...values,
        userId: user?.id || null,
        isGuestPurchase: !user,
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Paiement initié",
        description: "Vous allez être redirigé vers Moneroo pour finaliser le paiement",
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setTimeout(() => {
          if (user) {
            navigate(`/purchases`);
          } else {
            navigate(`/purchase-confirmation?orderId=${data.orderId}`);
          }
        }, 2000);
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values) => {
    // Validation côté client
    const errors = validateForm(values);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erreurs dans le formulaire",
        description: "Veuillez corriger les erreurs avant de continuer",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await paymentMutation.mutateAsync(values);
    } finally {
      setIsProcessing(false);
    }
  };

  if (fileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!fileId || error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Fichier introuvable</CardTitle>
            <CardDescription>
              Le fichier que vous souhaitez acheter n'existe pas ou n'est plus disponible
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/explore">
              <Button>Retour à l'exploration</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 pt-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8 mt-14">
          <Link href={`/file/${file.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Finaliser l'achat</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Informations du produit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getFileIcon(file.fileType)}
                Résumé de votre commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{file.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{file.description || "Aucune description disponible"}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille:</span>
                  <span className="font-medium">{file.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créateur:</span>
                  <span className="font-medium">{file.user.displayName || file.user.username}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{file.price} CFA</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Paiement sécurisé via Mobile Money</p>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de facturation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                Informations de facturation
              </CardTitle>
              <CardDescription>
                {user
                  ? "Vérifiez et complétez vos informations pour finaliser l'achat"
                  : "Veuillez remplir vos informations pour finaliser l'achat"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre prénom"
                              {...field}
                              className={formErrors.firstName ? "border-red-500" : ""}
                            />
                          </FormControl>
                          {formErrors.firstName && (
                            <FormMessage className="text-red-500">{formErrors.firstName}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre nom"
                              {...field}
                              className={formErrors.lastName ? "border-red-500" : ""}
                            />
                          </FormControl>
                          {formErrors.lastName && (
                            <FormMessage className="text-red-500">{formErrors.lastName}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+226 XX XX XX XX"
                            {...field}
                            className={formErrors.phoneNumber ? "border-red-500" : ""}
                          />
                        </FormControl>
                        {formErrors.phoneNumber && (
                          <FormMessage className="text-red-500">{formErrors.phoneNumber}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Votre email"
                            {...field}
                            className={formErrors.email ? "border-red-500" : ""}
                          />
                        </FormControl>
                        {formErrors.email && <FormMessage className="text-red-500">{formErrors.email}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays *</FormLabel>
                        <Select
                          value={field.value || undefined} // Assurez-vous que la valeur est toujours une chaîne ou undefined
                          onValueChange={(value) => field.onChange(value)} // Synchronisez correctement la valeur
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un pays" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.country && (
                          <FormMessage className="text-red-500">{formErrors.country}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville *</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre ville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Informations importantes :</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Tous les champs marqués d'un * sont obligatoires</li>
                      <li>Vos informations sont sécurisées et ne seront pas partagées</li>
                      <li>Le paiement est traité de manière sécurisée via Mobile Money</li>
                      {!user && <li>En tant qu'invité, vous recevrez un lien de téléchargement par email</li>}
                    </ul>
                  </div>

                  <Button type="submit" className="w-full" disabled={isProcessing || paymentMutation.isPending}>
                    {isProcessing || paymentMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Procéder au paiement ({file.price} CFA)
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
