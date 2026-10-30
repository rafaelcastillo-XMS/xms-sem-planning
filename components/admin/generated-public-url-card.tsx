"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GeneratedPublicUrlCardProps {
  publicPath: string;
}

export function GeneratedPublicUrlCard({ publicPath }: GeneratedPublicUrlCardProps) {
  const absoluteUrl = typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Public URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border bg-secondary/40 p-3 text-xs text-muted-foreground">
          {absoluteUrl}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(absoluteUrl)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
          <Button asChild size="sm">
            <Link href={publicPath} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open client page
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
