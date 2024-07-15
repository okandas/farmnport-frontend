import { Buyer } from "@/components/layouts/buyer"

interface BuyerPageProps {
    params: {
      slug: string
    }
  }
  
  export default  function BuyerPage({
    params
  }: BuyerPageProps) {
    return(
    <main className="min-h-[70lvh]">
    <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">
          <Buyer slug={params.slug} />
        </div>
    </div>
</main>
)
  }


