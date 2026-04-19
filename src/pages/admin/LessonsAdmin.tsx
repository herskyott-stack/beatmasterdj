import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Users, BarChart3, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CurriculumEditor from "@/components/lessons/CurriculumEditor";
import StudentAccessManager from "@/components/lessons/StudentAccessManager";
import StudentProgressViewer from "@/components/lessons/StudentProgressViewer";

const LessonsAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminCheck();

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/auth");
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">DJ Lessons LMS</span>
              </h1>
              <p className="text-muted-foreground">Manage curriculum, student access, and track progress.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
            </Button>
          </div>

          <Tabs defaultValue="curriculum">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="curriculum"><BookOpen className="w-4 h-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Curriculum</span></TabsTrigger>
              <TabsTrigger value="access"><Users className="w-4 h-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Access</span></TabsTrigger>
              <TabsTrigger value="progress"><BarChart3 className="w-4 h-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Progress</span></TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum">
              <Card variant="glass">
                <CardHeader><CardTitle>24-Module Curriculum</CardTitle></CardHeader>
                <CardContent><CurriculumEditor /></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access">
              <Card variant="glass">
                <CardHeader><CardTitle>Student Access</CardTitle></CardHeader>
                <CardContent><StudentAccessManager /></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <Card variant="glass">
                <CardHeader><CardTitle>Student Progress & Quiz Review</CardTitle></CardHeader>
                <CardContent><StudentProgressViewer /></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonsAdmin;
