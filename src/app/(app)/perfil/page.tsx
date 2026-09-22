import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/session";
import { userRepository } from "@/modules/users/repository";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { FORUM_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Meu perfil" };

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const profile = await userRepository.withProfileStats(sessionUser.id);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-lg">{initials(profile.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">
            Na comunidade desde{" "}
            {formatDate(profile.createdAt, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tópicos criados
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{profile.topicsCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comentários
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{profile.commentsCount}</CardContent>
        </Card>
      </div>

      {profile.recentTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tópicos recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {profile.recentTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/forum/topico/${topic.slug}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <span className="truncate">{topic.title}</span>
                <Badge variant="outline">{FORUM_STATUS_LABELS[topic.status]}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil">
          <Card>
            <CardContent className="pt-6">
              <ProfileForm
                defaultValues={{
                  name: profile.name,
                  avatar: profile.avatar ?? "",
                  bio: profile.bio ?? "",
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seguranca">
          <Card>
            <CardContent className="pt-6">
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
