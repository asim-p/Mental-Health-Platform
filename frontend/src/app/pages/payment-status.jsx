import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../services/api.js";

export function PaymentStatus({ status }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (status === "failure") {
        setIsLoading(false);
        setError("Payment was cancelled or failed.");
        return;
      }

      const dataParam = searchParams.get("data");
      if (!dataParam) {
        setIsLoading(false);
        setError("Invalid payment response data.");
        return;
      }

      try {
        await api.payments.verify({ data: dataParam });
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError(err.message || "Failed to verify payment.");
      }
    };

    verifyPayment();
  }, [searchParams, status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment with eSewa.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center">
          {error ? (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-8">{error}</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
              <p className="text-gray-600 mb-8">Your appointment has been successfully confirmed.</p>
            </>
          )}
          <Button 
            className="w-full" 
            onClick={() => navigate("/dashboard/patient")}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
