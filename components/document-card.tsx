import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface DocumentCardProps {
  id: string
  title: string
  excerpt: string
  updatedAt: string
}

export function DocumentCard({ id, title, excerpt, updatedAt }: DocumentCardProps) {
  return (
    <Card className="h-48 overflow-hidden hover:border-primary/50 hover:shadow-sm">
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{title}</h3>
        <p className="line-clamp-4 text-sm text-muted-foreground">{excerpt}</p>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 p-4 text-xs text-muted-foreground">Updated {updatedAt}</CardFooter>
    </Card>
  )
}

