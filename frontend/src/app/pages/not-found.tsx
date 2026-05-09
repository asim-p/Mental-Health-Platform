import { Link } from "react-router";
import { Button } from "../components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-teal-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-teal-600 hover:bg-teal-700">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
