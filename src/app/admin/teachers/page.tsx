"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { cn } from "@/lib/utils";
import { Plus, Save, Trash2 } from "lucide-react";

const gradients = [
  "from-[#064E3B] to-[#0d6b4f]",
  "from-[#881337] to-[#9f1239]",
  "from-[#1a1a1a] to-[#404040]",
];

export default function AdminTeachersPage() {
  const {
    teachers,
    classes,
    assignments,
    setTeacherClasses,
    addTeacher,
    updateTeacher,
    removeTeacher,
  } = useSchool();

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [draftClasses, setDraftClasses] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedTeacher && teachers[0]) {
      setSelectedTeacher(teachers[0].id);
      setDraftClasses(assignments[teachers[0].id] ?? []);
    }
  }, [teachers, assignments, selectedTeacher]);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function selectTeacher(id: string) {
    setSelectedTeacher(id);
    setDraftClasses(assignments[id] ?? []);
    setSaved(false);
  }

  function toggleClass(classId: string) {
    setDraftClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
    setSaved(false);
  }

  function handleSave() {
    if (!selectedTeacher) return;
    setTeacherClasses(selectedTeacher, draftClasses);
    setSaved(true);
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addTeacher({
      name: form.get("name") as string,
      subject: form.get("subject") as string,
      experience: form.get("experience") as string,
      bio: form.get("bio") as string,
      imageGradient: gradients[teachers.length % gradients.length],
    });
    setShowForm(false);
    e.currentTarget.reset();
  }

  const current = teachers.find((t) => t.id === selectedTeacher);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="الكادر التعليمي والفصول"
          description="إدارة بيانات المعلمين وإسناد الفصول لكل معلم"
        />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          إضافة معلم
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Input label="اسم المعلم" name="name" required />
            <Input label="التخصص" name="subject" required />
            <Input label="الخبرة" name="experience" required className="sm:col-span-2" />
            <Textarea label="نبذة (السيرة الذاتية)" name="bio" required className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <Button type="submit">إضافة للكادر</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-4 font-bold text-[#1a1a1a]">المعلمون</h3>
          <ul className="space-y-2">
            {teachers.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => selectTeacher(t.id)}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-start transition-colors",
                    selectedTeacher === t.id
                      ? "bg-[#064e3b]/10 text-[#064e3b]"
                      : "hover:bg-neutral-50"
                  )}
                >
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-[#1a1a1a]/50">{t.subject}</p>
                  <p className="mt-1 text-xs text-[#064e3b]">
                    {(assignments[t.id] ?? []).length} فصل مسند
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          {current ? (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">
                    إسناد الفصول — {current.name}
                  </h3>
                  <p className="text-sm text-[#1a1a1a]/50">{current.subject}</p>
                  {current.userId && (
                    <Badge variant="info" className="mt-2">
                      مربوط بحساب نظام
                    </Badge>
                  )}
                </div>
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => {
                    removeTeacher(current.id);
                    setSelectedTeacher(teachers[0]?.id ?? "");
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  حذف
                </Button>
              </div>

              <div className="mb-6 space-y-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-[#1a1a1a]">السيرة الذاتية</p>
                <Input
                  label="الخبرة"
                  value={current.experience}
                  onChange={(e) =>
                    updateTeacher(current.id, { experience: e.target.value })
                  }
                />
                <Textarea
                  label="نبذة"
                  value={current.bio}
                  onChange={(e) => updateTeacher(current.id, { bio: e.target.value })}
                />
              </div>

              <p className="mb-4 text-sm font-medium text-[#1a1a1a]/70">
                اختر الفصول المسندة لهذا المعلم:
              </p>

              <div className="space-y-3">
                {classes.map((cls) => {
                  const checked = draftClasses.includes(cls.id);
                  return (
                    <label
                      key={cls.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                        checked
                          ? "border-[#064e3b] bg-[#064e3b]/5"
                          : "border-neutral-200 hover:border-[#064e3b]/30"
                      )}
                    >
                      <div>
                        <p className="font-medium text-[#1a1a1a]">{cls.name}</p>
                        <p className="text-xs text-[#1a1a1a]/50">
                          {cls.studentCount} طالب
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleClass(cls.id)}
                        className="h-5 w-5 rounded accent-[#064e3b]"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  حفظ الإسناد
                </Button>
                {saved && (
                  <span className="text-sm text-[#064e3b]">تم الحفظ بنجاح</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-[#1a1a1a]/50">لا يوجد معلمون. أضف معلماً للبدء.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
