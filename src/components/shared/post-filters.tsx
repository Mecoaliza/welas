"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

export function PostFilters({
  categories,
  languages,
  sortOptions,
}: {
  categories: Option[];
  languages?: Option[];
  sortOptions: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const categoryItems = [{ value: "all", label: "Todas as categorias" }, ...categories];
  const languageItems = [{ value: "all", label: "Todos os idiomas" }, ...(languages ?? [])];

  return (
    <div className="flex flex-wrap gap-3">
      {categories.length > 0 && (
        <Select
          items={categoryItems}
          defaultValue={searchParams.get("categoria") ?? "all"}
          onValueChange={(value) => setParam("categoria", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {languages && languages.length > 0 && (
        <Select
          items={languageItems}
          defaultValue={searchParams.get("idioma") ?? "all"}
          onValueChange={(value) => setParam("idioma", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os idiomas</SelectItem>
            {languages.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select
        items={sortOptions}
        defaultValue={searchParams.get("sort") ?? "recent"}
        onValueChange={(value) => setParam("sort", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
