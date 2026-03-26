"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface PlaceResult {
    latitude: number
    longitude: number
    place_id: string
    address: string
    name: string
}

interface LocationPickerProps {
    onSelect: (data: PlaceResult) => void
    latitude?: number
    longitude?: number
    defaultValue?: string
}

export function LocationPicker({ onSelect, latitude, longitude, defaultValue }: LocationPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<google.maps.Map | null>(null)
    const markerRef = useRef<google.maps.Marker | null>(null)
    const onSelectRef = useRef(onSelect)
    onSelectRef.current = onSelect
    const [loaded, setLoaded] = useState(false)

    const defaultLat = latitude || -17.8292
    const defaultLng = longitude || 31.0522
    const hasCoords = !!(latitude && longitude)

    useEffect(() => {
        if (window.google?.maps?.places) {
            setLoaded(true)
            return
        }

        const existing = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existing) {
            existing.addEventListener("load", () => setLoaded(true))
            return
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.onload = () => setLoaded(true)
        document.head.appendChild(script)
    }, [])

    const updateMapMarker = useCallback((lat: number, lng: number) => {
        if (!mapInstanceRef.current) return
        const pos = new google.maps.LatLng(lat, lng)

        if (markerRef.current) {
            markerRef.current.setPosition(pos)
        } else {
            markerRef.current = new google.maps.Marker({
                position: pos,
                map: mapInstanceRef.current,
            })
        }

        mapInstanceRef.current.setCenter(pos)
        mapInstanceRef.current.setZoom(16)
    }, [])

    // Initialize map
    useEffect(() => {
        if (!loaded || !mapRef.current || mapInstanceRef.current) return

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: defaultLat, lng: defaultLng },
            zoom: hasCoords ? 16 : 12,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
        })

        if (hasCoords) {
            markerRef.current = new google.maps.Marker({
                position: { lat: defaultLat, lng: defaultLng },
                map: mapInstanceRef.current,
            })
        }

        // Click on map to set location
        mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return
            const lat = parseFloat(e.latLng.lat().toFixed(6))
            const lng = parseFloat(e.latLng.lng().toFixed(6))

            updateMapMarker(lat, lng)

            onSelectRef.current({
                latitude: lat,
                longitude: lng,
                place_id: "",
                address: "",
                name: "",
            })
        })
    }, [loaded])

    // Initialize autocomplete
    useEffect(() => {
        if (!loaded || !inputRef.current) return

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ["establishment", "geocode"],
            componentRestrictions: { country: "zw" },
            fields: ["geometry", "place_id", "formatted_address", "name"],
        })

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (!place.geometry?.location) return

            const lat = parseFloat(place.geometry.location.lat().toFixed(6))
            const lng = parseFloat(place.geometry.location.lng().toFixed(6))

            updateMapMarker(lat, lng)

            onSelectRef.current({
                latitude: lat,
                longitude: lng,
                place_id: place.place_id || "",
                address: place.formatted_address || "",
                name: place.name || "",
            })
        })
    }, [loaded, updateMapMarker])

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                defaultValue={defaultValue}
                placeholder="Search for a location on Google Maps..."
                className="block w-full rounded-md bg-white px-3.5 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
            <div
                ref={mapRef}
                className="h-72 w-full rounded-md border border-gray-300 dark:border-white/10"
            />
        </div>
    )
}
