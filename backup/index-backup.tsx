import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import SEOMeta from "@/components/seo-meta";
import { Form } from "@/components/app/form";
import { QRCodeReact } from "@/components/app/qrcode-react";
import { QRCodeReactDot } from "@/components/app/qrcode-react-dot";
import { QRCodeVanilla } from "@/components/app/qrcode-vanilla";
import { PackageInfoDialog } from "@/components/app/package-info-dialog";
import { CompareDrawer } from "@/components/app/compare-drawer";

export default function Home() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handlePackageInfoClick = (packageName: string) => {
    setSelectedPackage(packageName);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPackage(null);
  };

  const handleOpenCompare = () => {
    setIsCompareOpen(true);
  };

  const handleCloseCompare = () => {
    setIsCompareOpen(false);
  };

  return (
    <>
      <SEOMeta />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Form />
        
        {/* Results Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                QR Code Results & Performance Comparison
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Compare visual output and performance metrics across different libraries
              </p>
            </div>

            {/* QR Code Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <QRCodeVanilla onInfoClick={handlePackageInfoClick} />
              <QRCodeReact onInfoClick={handlePackageInfoClick} />
              <QRCodeReactDot onInfoClick={handlePackageInfoClick} />
            </div>
          </div>
        </div>

        {/* Package Info Dialog */}
        <PackageInfoDialog
          packageName={selectedPackage}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
        />

        {/* Compare Drawer */}
        <CompareDrawer
          isOpen={isCompareOpen}
          onClose={handleCloseCompare}
        />

        {/* Floating Action Button - Compare */}
        <motion.button
          onClick={handleOpenCompare}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <BarChart3 className="w-6 h-6" />
        </motion.button>
      </div>
    </>
  );
}
