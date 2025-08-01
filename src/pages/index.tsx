import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import SEOMeta from "@/components/seo-meta";

const Form = dynamic(() => import("@/components/app/form").then(mod => ({ default: mod.Form })), { ssr: false });
const TabResults = dynamic(() => import("@/components/app/tab-results").then(mod => ({ default: mod.TabResults })), { ssr: false });
const PackageInfoDialog = dynamic(() => import("@/components/app/package-info-dialog").then(mod => ({ default: mod.PackageInfoDialog })), { ssr: false });
const CompareDrawer = dynamic(() => import("@/components/app/compare-drawer").then(mod => ({ default: mod.CompareDrawer })), { ssr: false });
const SettingsDrawer = dynamic(() => import("@/components/app/settings-drawer").then(mod => ({ default: mod.SettingsDrawer })), { ssr: false });
const Footer = dynamic(() => import("@/components/app/footer").then(mod => ({ default: mod.Footer })), { ssr: false });

export default function Home() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <SEOMeta />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Form />
        
        {/* Results Section */}
        <TabResults onPackageInfoClick={handlePackageInfoClick} />

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

        {/* Settings Drawer */}
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
        />

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
          {/* Settings FAB */}
          <motion.button
            onClick={handleOpenSettings}
            className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/25"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            title="QR Code Settings"
          >
            <Settings className="w-6 h-6" />
          </motion.button>

          {/* Compare FAB */}
          <motion.button
            onClick={handleOpenCompare}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/25"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            title="Performance Comparison"
          >
            <BarChart3 className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
