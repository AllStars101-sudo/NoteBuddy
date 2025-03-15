import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { formatDate } from "@/lib/date-utils"

interface DocumentCardProps {
  id: string
  title: string
  excerpt: string
  updatedAt: string | Date
}

export function DocumentCard({ id, title, excerpt, updatedAt }: DocumentCardProps) {
  return (
    <Link href={`/documents/${id}`} className="block">
      <Card className="h-48 overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all">
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{title}</h3>
          <p className="line-clamp-4 text-sm text-muted-foreground">{excerpt}</p>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 p-4 text-xs text-muted-foreground">
          Updated {formatDate(updatedAt)}
        </CardFooter>
      </Card>
    </Link>
  )
}

