'use client'
import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  Sparkles,
  Tags,
  Eye,
  Edit3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import React from "react";
// import { useArticleStore } from "@/stores";

// CKEditor 5 imports
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Paragraph,
  List,
  Heading,
  PasteFromOffice,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  Link,
  Alignment,
  BlockQuote,
  Indent,
  Undo,
  FileRepository,
  FontColor,
  FontBackgroundColor,
  GeneralHtmlSupport,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import {
  addItemInUseStateArray,
  removeItem,
  setTextToString,
  supabase,
} from "./utility/setup";
import { useRouter } from "next/navigation";
import createArticle from "@/libs/article/createArticle";

const categories = [
  { key: "health_tip", label: "เคล็ดลับสุขภาพ" },
  { key: "review", label: "รีวิว" },
  { key: "product", label: "สินค้า" },
];

/**
 * Custom Supabase Image Upload Adapter for CKEditor 5
 */
class SupabaseUploadAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const fileName = `${Date.now()}-${file.name}`;

          supabase.storage
            .from("article_images")
            .upload(fileName, file)
            .then(({ data, error }) => {
              if (error) {
                reject(error);
              } else {
                const {
                  data: { publicUrl },
                } = supabase.storage
                  .from("article_images")
                  .getPublicUrl(data.path);
                resolve({ default: publicUrl });
              }
            })
            .catch(reject);
        }),
    );
  }

  abort() {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomUploadAdapterPlugin(editor: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    return new SupabaseUploadAdapter(loader);
  };
}

export default function WriteArticlePage({ token }: { token: string }) {
  const navigate = useRouter();
  // const { createArticle, loading } = useArticleStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  // const [formData, setFormData] = useState({
  //   title: "",
  //   category: "health_tip",
  //   cover_image: "",
  //   excerpt: "",
  //   body: "",
  //   tags: [] as string[],
  //   isAIGenerated: false,
  // });
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("health_tip");
  const [coverImage, setCoverImage] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [isAIGenerated, setIsAIGenerated] = React.useState(false);

  const [tagInput, setTagInput] = useState("");

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("กรุณาอัปโหลดไฟล์รูปภาพ (png, jpg, jpeg, webp)");
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    setIsUploadingCover(true);
    const toastId = toast.loading("กำลังอัปโหลดรูปหน้าปก...");

    try {
      const { data, error } = await supabase.storage
        .from("article_images")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("article_images").getPublicUrl(data.path);

      setCoverImage(publicUrl);
      toast.success("อัปโหลดรูปหน้าปกสำเร็จ", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("อัปโหลดล้มเหลว", { id: toastId });
    } finally {
      setIsUploadingCover(false);
    }
  };

  // const removeTag = (tag: string) => {
  //   // setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });

  // };

  const { previewBody, previewExcerpt } = useMemo(() => {
    if (mode !== "preview") return { previewBody: "", previewExcerpt: "" };

    const bodyHtml = (body || "").replace(
      /#([\u0E00-\u0E7Fa-zA-Z0-9_]+)/g,
      '<span class="text-primary font-bold hover:underline cursor-pointer" data-hashtag="$1">#$1</span>',
    );

    const excerptHtml = (excerpt || "").replace(
      /#([\u0E00-\u0E7Fa-zA-Z0-9_]+)/g,
      '<span class="text-primary font-bold hover:underline cursor-pointer" data-hashtag="$1">#$1</span>',
    );

    return {
      previewBody: bodyHtml,
      previewExcerpt: excerptHtml,
    };
  }, [mode, body, excerpt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || !excerpt) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // let pharmacistId = "rph-001";
    // const currentUser = useAuthStore.getState().currentUser;
    // if (currentUser) {
    //   try {
    //     const { data: pharmaRec } = await supabase2
    //       .from("pharmacists")
    //       .select("id")
    //       .eq("name", currentUser.name)
    //       .maybeSingle();
    //     if (pharmaRec) {
    //       pharmacistId = pharmaRec.id;
    //     }
    //   } catch (err) {
    //     console.error("Error resolving pharmacist record:", err);
    //   }
    // }

    const resultId = await createArticle(
      {
        tags,
        body,
        excerpt,
        title,
        isAIGenerated,
        category,
        coverImage,
      },
      token,
    );

    if (resultId) {
      toast.success("บันทึกบทความสำเร็จ");
      navigate.push(`/articles/from-id/${resultId._id}`);
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  if (!mounted) return null;

  return (
    <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background text-foreground">
      <div className="w-full px-6 sm:px-12 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate.push("../")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            กลับ
          </button>

          <div className="flex bg-muted p-1 rounded-xl border">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "edit"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Edit3 className="h-4 w-4" />
              แก้ไข
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "preview"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Eye className="h-4 w-4" />
              ตัวอย่าง
            </button>
          </div>
          <div className="w-12" />
        </div>

        {mode === "edit" ? (
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-8 animate-in fade-in duration-300"
          >
            <Card className="w-full border-border/40 shadow-sm overflow-hidden">
              <CardContent className="p-8 sm:p-12 space-y-8">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">
                    หัวข้อบทความ
                  </label>
                  <Input
                    placeholder="เช่น วิธีใช้ยาพาราเซตามอลอย่างปลอดภัย..."
                    value={title}
                    onChange={setTextToString(setTitle, true)}
                    className="text-xl font-bold h-14 border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 bg-transparent"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      รูปหน้าปก (อัปโหลดไฟล์)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        disabled={isUploadingCover}
                        className="rounded-xl cursor-pointer flex items-center h-12 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      {isUploadingCover && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          กำลังอัปโหลด...
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      รองรับไฟล์ .png, .jpg, .jpeg, .webp (แนะนำขนาด 1200x500
                      px)
                    </p>
                  </div>
                  {coverImage && (
                    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border bg-muted group">
                      <img
                        src={coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Badge className="bg-white/90 text-black border-none">
                          รูปหน้าปกปัจจุบัน
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category & AI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">หมวดหมู่</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setCategory(c.key)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            category === c.key
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-background text-muted-foreground border-border/60 hover:border-primary/40"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-secondary" />
                      ใช้ AI ช่วยเขียน?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAIGenerated((prev) => !prev);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isAIGenerated ? "bg-secondary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isAIGenerated ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    คำเกริ่นนำ (Excerpt)
                  </label>
                  <textarea
                    placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..."
                    value={excerpt}
                    onChange={setTextToString(setExcerpt, true)}
                    className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Body - CKEditor 5 */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    เนื้อหาบทความ (Rich Text)
                  </label>
                  <div className="ckeditor-wrapper rounded-2xl overflow-hidden shadow-sm border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <CKEditor
                      editor={ClassicEditor}
                      config={{
                        licenseKey: "GPL",
                        plugins: [
                          Essentials,
                          Bold,
                          Italic,
                          Underline,
                          Strikethrough,
                          Paragraph,
                          List,
                          Heading,
                          PasteFromOffice,
                          Image,
                          ImageUpload,
                          ImageToolbar,
                          ImageCaption,
                          ImageStyle,
                          ImageResize,
                          Link,
                          Alignment,
                          BlockQuote,
                          Indent,
                          Undo,
                          FileRepository,
                          FontColor,
                          FontBackgroundColor,
                          GeneralHtmlSupport,
                        ],
                        toolbar: [
                          "undo",
                          "redo",
                          "|",
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "strikethrough",
                          "fontColor",
                          "fontBackgroundColor",
                          "|",
                          "alignment",
                          "bulletedList",
                          "numberedList",
                          "outdent",
                          "indent",
                          "|",
                          "link",
                          "uploadImage",
                          "blockQuote",
                        ],
                        placeholder: "เริ่มเขียนเนื้อหาบทความที่นี่...",
                        fontColor: {
                          colors: [],
                        },
                        htmlSupport: {
                          allow: [
                            {
                              name: "span",
                              styles: ["color", "background-color"],
                            },
                          ],
                        },
                        heading: {
                          options: [
                            {
                              model: "paragraph",
                              title: "Paragraph",
                              class: "ck-heading_paragraph",
                            },
                            {
                              model: "heading1",
                              view: "h1",
                              title: "Heading 1",
                              class: "ck-heading_heading1",
                            },
                            {
                              model: "heading2",
                              view: "h2",
                              title: "Heading 2",
                              class: "ck-heading_heading2",
                            },
                            {
                              model: "heading3",
                              view: "h3",
                              title: "Heading 3",
                              class: "ck-heading_heading3",
                            },
                          ],
                        },
                        image: {
                          toolbar: [
                            "imageStyle:inline",
                            "imageStyle:block",
                            "imageStyle:side",
                            "|",
                            "toggleImageCaption",
                            "imageTextAlternative",
                          ],
                        },
                        extraPlugins: [CustomUploadAdapterPlugin],
                      }}
                      data={body}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setBody(data);
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Tags className="h-3.5 w-3.5" />
                    แท็ก
                  </label>
                  <Input
                    placeholder="พิมพ์แท็กแล้วกด Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        if (tags.includes(tagInput.trim())) {
                          setTags(addItemInUseStateArray(tagInput.trim()));
                        }
                        setTagInput("");
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag, i) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1 gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(i, setTags);
                          }}
                          className="hover:text-destructive transition-colors"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pb-20">
              <Button
                type="submit"
                // disabled={loading}
                className="flex-1 h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 gap-2"
              >
                {
                  // loading ? (
                  //   <Loader2 className="h-5 w-5 animate-spin" />
                  // ) :
                  <Save className="h-5 w-5" />
                }
                เผยแพร่บทความ
              </Button>
            </div>
          </form>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Preview Mode */}
            <Card className="border-border/40 shadow-sm overflow-hidden min-h-[600px]">
              {coverImage && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-10">
                <div className="w-full">
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline">
                      {categories.find((c) => c.key === category)?.label}
                    </Badge>
                    {isAIGenerated && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold mb-6 leading-tight">
                    {title || "หัวข้อบทความ"}
                  </h1>

                  <div className="prose prose-thai prose-img:rounded-3xl prose-img:shadow-lg max-w-none">
                    <p
                      className="text-xl text-muted-foreground mb-8 leading-relaxed font-light italic"
                      dangerouslySetInnerHTML={{
                        __html: previewExcerpt || "คำเกริ่นนำจะแสดงตรงนี้...",
                      }}
                    />
                    <div
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          previewBody ||
                          "<p class='text-muted-foreground'>เนื้อหาบทความจะแสดงตรงนี้...</p>",
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t border-border/40">
                    {tags.map((t) => (
                      <span key={t} className="text-sm text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* CKEditor Custom Styles */}
      <style>{`
        .ckeditor-wrapper .ck-editor__editable_inline,
        .ckeditor-wrapper .ck-editor__editable {
          min-height: 800px;
          padding: 2rem 4rem !important;
          font-family: inherit;
        }
        @media (max-width: 640px) {
          .ckeditor-wrapper .ck-editor__editable_inline,
          .ckeditor-wrapper .ck-editor__editable {
             padding: 1.5rem !important;
          }
        }
        .ckeditor-wrapper .ck-toolbar {
          border: none !important;
          border-bottom: 1px solid hsl(var(--border) / 0.4) !important;
          background: hsl(var(--muted) / 0.3) !important;
          padding: 0.5rem !important;
        }
        .ckeditor-wrapper .ck-content {
          font-size: 1rem;
          line-height: 1.75;
        }
        .ckeditor-wrapper .ck-content h1, 
        .ckeditor-wrapper .ck-content h2, 
        .ckeditor-wrapper .ck-content h3 {
          font-weight: bold;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        .ckeditor-wrapper .ck-content h2 { font-size: 1.875rem; line-height: 2.25rem; }
        .ckeditor-wrapper .ck-content h3 { font-size: 1.5rem; line-height: 2rem; }
        .ckeditor-wrapper .ck-content img {
          border-radius: 1rem;
        }
        
        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 2rem auto;
          display: block;
        }
        .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 {
          font-weight: bold;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        .rich-text-content h2 { font-size: 1.875rem; line-height: 2.25rem; }
        .rich-text-content h3 { font-size: 1.5rem; line-height: 2rem; }
        .rich-text-content ul, .rich-text-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .rich-text-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
