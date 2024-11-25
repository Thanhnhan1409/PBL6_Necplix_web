import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import MyShows from "@/components/my-shows"

export const metadata: Metadata = {
  title: "My List",
  description: "All TV shows and movies you've added to your list",
}

export default async function MyListPage() {

  const user = await getCurrentUser({
    username: "anh@gmail.com",
    password: "123456Aa"
  })
  console.log('user 1', user)
  
  if (!user) {
    redirect("/login")
  }

  return (
    <section className="pb-16 pt-10">
      <MyShows user={user} />
    </section>
  )
}
