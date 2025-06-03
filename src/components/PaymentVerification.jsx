
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Download, Mail } from "lucide-react"
import { apiRequest } from "@/lib/queryClient"
import { Link } from "wouter"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

export default function PaymentVerificationPage() {
    const { toast } = useToast()
    const [location] = useLocation()
    
    const searchParams = new URLSearchParams(window.location.search)
    const paymentId = searchParams.get("paymentId")

    const {
        data: paymentData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [`/api/purchase/verify/${paymentId}`],
        queryFn: () => apiRequest("GET", `/api/purchase/verify/${paymentId}`),
        enabled: !!paymentId,
        retry: 3,
        retryDelay: 2000,
    })
    
    console.log("Payment Data:", paymentData)

    const downloadFile = async (downloadUrl) => {
        try {
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            
            link.href = url
            link.setAttribute('download', 'file.pdf')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast({
                title: "Téléchargement réussi",
                description: "Votre fichier a été téléchargé avec succès.",
            })

        } catch (error) {
            console.error("Error downloading the file:", error)
            toast({
                variant: "destructive",
                title: "Erreur de téléchargement",
                description: "Une erreur est survenue lors du téléchargement du fichier.",
            })
        }
    }
    const downloadFileDirectly = (downloadUrl) => {
        // Lancer le téléchargement du fichier directement sans passer par apiRequest
        const link = document.createElement('a')
        link.href = downloadUrl
        const fileName = downloadUrl.split('/').pop() || 'file' // Extraire le nom du fichier depuis l'URL
        link.setAttribute('download', fileName) // Utiliser le nom du fichier extrait  document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

    }

    const handleDownload = (downloadUrl) => {
        //lancer le téléchargement du fichier directement sans passer par apiRequest sans utiliser axios
        downloadFileDirectly(downloadUrl)
        toast({
            title: "Téléchargement en cours",
            description: "Votre fichier est en cours de téléchargement. Veuillez patienter.",
        })
    }

    if (!paymentId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <CardTitle className="text-red-800">Lien invalide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-gray-700">
                            Le lien de vérification de paiement est invalide ou expiré.
                        </p>
                        <Link href="/explore">
                            <Button className="w-full">Retour à l'accueil</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Clock className="h-6 w-6 text-blue-600" />
                            Vérification du paiement...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600">
                            Nous vérifions le statut de votre paiement. Veuillez patienter.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (paymentData && paymentData.status === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <CardTitle className="text-green-800">Paiement réussi !</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert className="border-green-200 bg-green-50">
                            <Mail className="h-4 w-4" />
                            <AlertDescription className="text-green-800">
                                <strong>Email de confirmation envoyé à :</strong><br />
                                {paymentData.buyerEmail}
                            </AlertDescription>
                        </Alert>

                        {paymentData.downloadUrl && (
                            <div className="space-y-4 text-center">
                                <p className="text-gray-700 mb-4">
                                    Votre fichier est prêt à être téléchargé !
                                </p>
                                <Button
                                    onClick={() => handleDownload(paymentData.downloadUrl)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Télécharger le fichier
                                </Button>

                                <Alert className="border-blue-200 bg-blue-50 mt-4">
                                    <Mail className="h-4 w-4" />
                                    <AlertDescription className="text-blue-800">
                                        Le lien de téléchargement a également été envoyé par email pour votre convenance.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div className="text-center pt-4">
                            <Link href="/explore">
                                <Button variant="outline">Continuer l'exploration</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || (paymentData && paymentData.status === 'pending')) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                        <CardTitle className="text-yellow-800">Achat en cours</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-gray-700">
                            Votre paiement est en cours de traitement. Cela peut prendre quelques minutes.
                        </p>

                        <Alert className="border-yellow-200 bg-yellow-50">
                            <Mail className="h-4 w-4" />
                            <AlertDescription className="text-yellow-800">
                                Un email de confirmation vous sera envoyé dès que votre achat sera finalisé.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3 pt-4">
                            <Button onClick={() => refetch()} variant="outline" className="w-full">
                                Vérifier à nouveau
                            </Button>
                            <Link href="/explore">
                                <Button variant="ghost" className="w-full">
                                    Retour à l'accueil
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <CardTitle className="text-red-800">Échec d'achat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-gray-700">
                        Nous n'avons pas pu traiter votre paiement. Veuillez réessayer.
                    </p>

                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            {error?.message || "Une erreur est survenue lors du traitement de votre paiement."}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3 pt-4">
                        <Button onClick={() => refetch()} variant="outline" className="w-full">
                            Réessayer la vérification
                        </Button>
                        <Link href="/explore">
                            <Button variant="ghost" className="w-full">
                                Retour à l'accueil
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
