import { ProductImageGallery } from "@/components/shared/ProductImageGallery"

export function DocumentImages({ images, title }: { images: string[]; title: string }) {
    return (
        <ProductImageGallery
            images={images.map(src => ({ img: { src } }))}
            name={title}
            height={480}
        />
    )
}
