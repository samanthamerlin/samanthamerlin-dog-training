"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GraduationCap,
  Plus,
  BookOpen,
  Play,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Video,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtubeVideoId: string | null;
  videoDuration: number | null;
  isFreePreview: boolean;
  isPublished: boolean;
  sortOrder: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: Lesson[];
}

interface ContentTier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  isActive: boolean;
  modules: Module[];
}

export default function AdminContentPage() {
  const [tiers, setTiers] = useState<ContentTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ContentTier | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Form states
  const [tierForm, setTierForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    isActive: true,
  });

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    sortOrder: 0,
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    youtubeVideoId: "",
    videoDuration: "",
    content: "",
    isFreePreview: false,
    isPublished: true,
    sortOrder: 0,
  });

  const fetchTiers = async () => {
    try {
      const response = await fetch("/api/admin/content/tiers");
      const data = await response.json();
      if (response.ok) {
        setTiers(data.tiers || []);
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Tier handlers
  const handleSaveTier = async () => {
    try {
      const url = editingTier
        ? `/api/admin/content/tiers/${editingTier.id}`
        : "/api/admin/content/tiers";
      const method = editingTier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tierForm,
          price: parseFloat(tierForm.price),
        }),
      });

      if (response.ok) {
        await fetchTiers();
        setTierDialogOpen(false);
        resetTierForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save tier");
      }
    } catch (error) {
      console.error("Failed to save tier:", error);
      alert("Failed to save tier");
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm("Are you sure you want to delete this tier? All modules and lessons will be deleted.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/tiers/${tierId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTiers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete tier");
      }
    } catch (error) {
      console.error("Failed to delete tier:", error);
      alert("Failed to delete tier");
    }
  };

  const resetTierForm = () => {
    setEditingTier(null);
    setTierForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      isActive: true,
    });
  };

  const openTierDialog = (tier?: ContentTier) => {
    if (tier) {
      setEditingTier(tier);
      setTierForm({
        name: tier.name,
        slug: tier.slug,
        description: tier.description || "",
        price: tier.price,
        isActive: tier.isActive,
      });
    } else {
      resetTierForm();
    }
    setTierDialogOpen(true);
  };

  // Module handlers
  const handleSaveModule = async () => {
    if (!selectedTierId) return;

    try {
      const url = editingModule
        ? `/api/admin/content/modules/${editingModule.id}`
        : "/api/admin/content/modules";
      const method = editingModule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...moduleForm,
          tierId: selectedTierId,
        }),
      });

      if (response.ok) {
        await fetchTiers();
        setModuleDialogOpen(false);
        resetModuleForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save module");
      }
    } catch (error) {
      console.error("Failed to save module:", error);
      alert("Failed to save module");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? All lessons will be deleted.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTiers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete module");
      }
    } catch (error) {
      console.error("Failed to delete module:", error);
      alert("Failed to delete module");
    }
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setSelectedTierId(null);
    setModuleForm({
      title: "",
      description: "",
      sortOrder: 0,
    });
  };

  const openModuleDialog = (tierId: string, module?: Module) => {
    setSelectedTierId(tierId);
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        description: module.description || "",
        sortOrder: module.sortOrder,
      });
    } else {
      const tier = tiers.find((t) => t.id === tierId);
      const maxOrder = tier?.modules.reduce((max, m) => Math.max(max, m.sortOrder), -1) ?? -1;
      setModuleForm({
        title: "",
        description: "",
        sortOrder: maxOrder + 1,
      });
    }
    setModuleDialogOpen(true);
  };

  // Lesson handlers
  const handleSaveLesson = async () => {
    if (!selectedModuleId) return;

    try {
      const url = editingLesson
        ? `/api/admin/content/lessons/${editingLesson.id}`
        : "/api/admin/content/lessons";
      const method = editingLesson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lessonForm,
          moduleId: selectedModuleId,
          videoDuration: lessonForm.videoDuration ? parseInt(lessonForm.videoDuration) : null,
        }),
      });

      if (response.ok) {
        await fetchTiers();
        setLessonDialogOpen(false);
        resetLessonForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save lesson");
      }
    } catch (error) {
      console.error("Failed to save lesson:", error);
      alert("Failed to save lesson");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTiers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete lesson");
      }
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      alert("Failed to delete lesson");
    }
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setSelectedModuleId(null);
    setLessonForm({
      title: "",
      description: "",
      youtubeVideoId: "",
      videoDuration: "",
      content: "",
      isFreePreview: false,
      isPublished: true,
      sortOrder: 0,
    });
  };

  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || "",
        youtubeVideoId: lesson.youtubeVideoId || "",
        videoDuration: lesson.videoDuration?.toString() || "",
        content: "",
        isFreePreview: lesson.isFreePreview,
        isPublished: lesson.isPublished,
        sortOrder: lesson.sortOrder,
      });
    } else {
      const tier = tiers.find((t) => t.modules.some((m) => m.id === moduleId));
      const module = tier?.modules.find((m) => m.id === moduleId);
      const maxOrder = module?.lessons.reduce((max, l) => Math.max(max, l.sortOrder), -1) ?? -1;
      setLessonForm({
        title: "",
        description: "",
        youtubeVideoId: "",
        videoDuration: "",
        content: "",
        isFreePreview: false,
        isPublished: true,
        sortOrder: maxOrder + 1,
      });
    }
    setLessonDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Content</h1>
          <p className="text-muted-foreground">
            Manage training tiers, modules, and lessons
          </p>
        </div>
        <Button onClick={() => openTierDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Tier
        </Button>
      </div>

      {tiers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training tier to get started.
            </p>
            <Button onClick={() => openTierDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tiers.map((tier) => (
            <Card key={tier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {tier.name}
                      {!tier.isActive && (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${parseFloat(tier.price).toFixed(0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {tier.modules.length} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {tier.modules.reduce((t, m) => t + m.lessons.length, 0)} lessons
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModuleDialog(tier.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Module
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openTierDialog(tier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTier(tier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {tier.modules.length > 0 && (
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {tier.modules
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((module, moduleIndex) => (
                        <AccordionItem
                          key={module.id}
                          value={module.id}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                                  {moduleIndex + 1}
                                </span>
                                <span className="font-medium">{module.title}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({module.lessons.length} lessons)
                                </span>
                              </div>
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openLessonDialog(module.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openModuleDialog(tier.id, module)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteModule(module.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {module.lessons.length === 0 ? (
                              <div className="py-4 text-center text-muted-foreground">
                                No lessons yet.{" "}
                                <button
                                  className="text-primary underline"
                                  onClick={() => openLessonDialog(module.id)}
                                >
                                  Add one
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 pt-2">
                                {module.lessons
                                  .sort((a, b) => a.sortOrder - b.sortOrder)
                                  .map((lesson, lessonIndex) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">
                                          {lessonIndex + 1}.
                                        </span>
                                        {lesson.youtubeVideoId ? (
                                          <Video className="h-4 w-4 text-primary" />
                                        ) : (
                                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{lesson.title}</span>
                                        {lesson.isFreePreview && (
                                          <Badge variant="secondary" className="text-xs">
                                            Free Preview
                                          </Badge>
                                        )}
                                        {!lesson.isPublished && (
                                          <Badge variant="outline" className="text-xs">
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Draft
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {lesson.videoDuration && (
                                          <span className="text-sm text-muted-foreground">
                                            {Math.floor(lesson.videoDuration / 60)}:{(lesson.videoDuration % 60).toString().padStart(2, "0")}
                                          </span>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => openLessonDialog(module.id, lesson)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleDeleteLesson(lesson.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? "Edit Tier" : "New Tier"}</DialogTitle>
            <DialogDescription>
              {editingTier
                ? "Update the training tier details."
                : "Create a new training tier for your courses."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tierName">Name</Label>
              <Input
                id="tierName"
                value={tierForm.name}
                onChange={(e) => {
                  setTierForm({
                    ...tierForm,
                    name: e.target.value,
                    slug: editingTier ? tierForm.slug : generateSlug(e.target.value),
                  });
                }}
                placeholder="e.g., Foundation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierSlug">Slug</Label>
              <Input
                id="tierSlug"
                value={tierForm.slug}
                onChange={(e) => setTierForm({ ...tierForm, slug: e.target.value })}
                placeholder="e.g., foundation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierDescription">Description</Label>
              <Textarea
                id="tierDescription"
                value={tierForm.description}
                onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                placeholder="Describe what's included in this tier..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierPrice">Price ($)</Label>
              <Input
                id="tierPrice"
                type="number"
                step="0.01"
                value={tierForm.price}
                onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                placeholder="29.00"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="tierActive"
                checked={tierForm.isActive}
                onCheckedChange={(checked) => setTierForm({ ...tierForm, isActive: checked })}
              />
              <Label htmlFor="tierActive">Active (visible to clients)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTier}>
              {editingTier ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "New Module"}</DialogTitle>
            <DialogDescription>
              {editingModule
                ? "Update the module details."
                : "Add a new module to this tier."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleTitle">Title</Label>
              <Input
                id="moduleTitle"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Basic Commands"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <Textarea
                id="moduleDescription"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Describe what's covered in this module..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleOrder">Order</Label>
              <Input
                id="moduleOrder"
                type="number"
                value={moduleForm.sortOrder}
                onChange={(e) => setModuleForm({ ...moduleForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule}>
              {editingModule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson details."
                : "Add a new lesson to this module."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Title</Label>
              <Input
                id="lessonTitle"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g., Introduction to Sit Command"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDescription">Description</Label>
              <Textarea
                id="lessonDescription"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief description of what this lesson covers..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonVideoId">YouTube Video ID</Label>
                <Input
                  id="lessonVideoId"
                  value={lessonForm.youtubeVideoId}
                  onChange={(e) => setLessonForm({ ...lessonForm, youtubeVideoId: e.target.value })}
                  placeholder="e.g., dQw4w9WgXcQ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonDuration">Duration (seconds)</Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  value={lessonForm.videoDuration}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoDuration: e.target.value })}
                  placeholder="300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonOrder">Order</Label>
              <Input
                id="lessonOrder"
                type="number"
                value={lessonForm.sortOrder}
                onChange={(e) => setLessonForm({ ...lessonForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="lessonFreePreview"
                  checked={lessonForm.isFreePreview}
                  onCheckedChange={(checked) => setLessonForm({ ...lessonForm, isFreePreview: checked })}
                />
                <Label htmlFor="lessonFreePreview">Free Preview</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="lessonPublished"
                  checked={lessonForm.isPublished}
                  onCheckedChange={(checked) => setLessonForm({ ...lessonForm, isPublished: checked })}
                />
                <Label htmlFor="lessonPublished">Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson}>
              {editingLesson ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
