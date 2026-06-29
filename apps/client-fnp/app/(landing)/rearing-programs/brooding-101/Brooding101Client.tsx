"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const SECTIONS = [
    { label: "About" },
    { label: "Housing" },
    { label: "Collection" },
    { label: "Preparations" },
    { label: "Brooding" },
    { label: "Biosecurity" },
    { label: "Vaccinations" },
]

function SubHeading({ title }: { title: string }) {
    return (
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-6 mb-3 first:mt-0">
            {title}
        </h3>
    )
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3">
            {items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                    <span className="mt-[5px] w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
    return (
        <div className="overflow-x-auto rounded-lg border mt-3">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-primary text-primary-foreground">
                        {headers.map((h, i) => (
                            <th key={i} className="px-4 py-2.5 text-left font-semibold text-xs whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2.5 text-muted-foreground text-sm">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function SectionCard({
    index,
    title,
    sectionRef,
    children,
}: {
    index: number
    title: string
    sectionRef: (el: HTMLElement | null) => void
    children: React.ReactNode
}) {
    return (
        <section
            ref={sectionRef}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
        >
            <div className="px-5 pt-5 pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-primary-foreground">{index}</span>
                    </div>
                    <h2 className="text-lg font-heading tracking-tight">{title}</h2>
                </div>
            </div>
            <div className="px-5 py-5">{children}</div>
        </section>
    )
}

export function Brooding101Client() {
    const [activeSection, setActiveSection] = useState(0)
    const sectionRefs = useRef<(HTMLElement | null)[]>([])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = sectionRefs.current.indexOf(entry.target as HTMLElement)
                        if (index !== -1) setActiveSection(index)
                    }
                })
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
        )
        sectionRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
        return () => observer.disconnect()
    }, [])

    const scrollToSection = (index: number) => {
        const el = sectionRefs.current[index]
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 140
            window.scrollTo({ top: y, behavior: "smooth" })
        }
    }

    return (
        <div className="min-h-screen bg-background">

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/programs" className="hover:text-foreground transition-colors">Programs</Link>
                        <span className="mx-2">/</span>
                        <Link href="/rearing-programs" className="hover:text-foreground transition-colors">Rearing Programs</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Brooding 101</span>
                    </nav>
                </div>
            </div>

            {/* Hero */}
            <section className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400">
                            Ross 308 Broilers
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            7 Sections
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-heading tracking-tight">Brooding 101</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        by <span className="font-medium text-foreground">Charles Stewart</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                        Warmth, water, feed, ventilation, and daily observation — a complete guide to day-old chick management.
                    </p>
                </div>
            </section>

            {/* Sticky Section Navigator */}
            <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                        {SECTIONS.map(({ label }, index) => (
                            <button
                                key={label}
                                onClick={() => scrollToSection(index)}
                                className={`flex-shrink-0 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    activeSection === index
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${activeSection === index ? "bg-primary-foreground" : "bg-amber-500"}`} />
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* 1. About */}
                <SectionCard
                    index={1}
                    title="About Charles Stewart Day-Old Chicks"
                    sectionRef={(el) => { sectionRefs.current[0] = el }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Charles Stewart Day-Old Chicks, established in 1958, is a leading producer and supplier of
                        high-quality, affordable day-old chicks in Zimbabwe. We are dedicated to empowering farmers
                        nationwide by providing superior chicks that support sustainable poultry farming through
                        innovation, efficiency, and excellence. Our commitment ensures that farmers receive vigorous,
                        healthy chicks that grow into productive flocks.
                    </p>
                    <SubHeading title="Ross 308 Broiler Day-Old Chicks Are Renowned For" />
                    <BulletList items={[
                        "Excellent feed conversion ratio, helping reduce feed costs.",
                        "Rapid growth rate for quicker market readiness.",
                        "High meat yield, maximizing profitability.",
                        "Adaptability to various management and environmental systems, making them suitable for diverse farming conditions.",
                    ]} />
                </SectionCard>

                {/* 2. Housing Essentials */}
                <SectionCard
                    index={2}
                    title="Housing Essentials"
                    sectionRef={(el) => { sectionRefs.current[1] = el }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        By taking the following steps one can ensure the health, vitality, and survival of day-old chicks.
                    </p>

                    <SubHeading title="Building Materials" />
                    <BulletList items={[
                        "Building materials commonly include bricks, wood for roof beams, and concrete for the floor and foundation. A door should be placed on one of the sidewalls for easy entry.",
                        "The floor should be a smooth concrete slab for easy cleaning and to prevent disease.",
                    ]} />

                    <SubHeading title="Stocking Density — Traditional Open House" />
                    <BulletList items={[
                        "Stocked at a density of 10 to 15 birds per square meter, so for 100 chicks, a floor area of about 7 to 10 square meters is required.",
                        "Maintain recommended stocking densities to avoid overcrowding — approximately 30 chicks per square meter in the first week.",
                    ]} />
                    <DataTable
                        headers={["Day", "Chicks / sqm"]}
                        rows={[["1 – 7", "30"], ["7 – 14", "25"], ["21 – 35", "10"]]}
                    />

                    <SubHeading title="Feeders" />
                    <BulletList items={[
                        "Ensure the correct number and size of feeders and water fonts (e.g. for 100 chicks, 4 feeders and 4 water fonts).",
                        "Initially in chick fonts or trays, then tube feeders after 4 days.",
                        "Position feeders and drinkers so chicks do not move more than 1 meter to access feed and water.",
                        "Feeders and drinkers should be adjusted in height as the birds grow to maximise feed efficiency.",
                    ]} />
                    <DataTable
                        headers={["Age in Days", "Feeders", "Water Fonts"]}
                        rows={[
                            ["0 – 7", "4 x Hinged Feeders (4 – 6 kg)", "4 x 4L Water Fonts"],
                            ["8+", "4 x Hinged Feeders (8 – 12 kg)", "4 x 10L Water Fonts"],
                        ]}
                    />

                    <SubHeading title="Lighting" />
                    <BulletList items={[
                        "Proper light intensity and even distribution are essential for the health and growth of broiler chicks.",
                        "Use energy-efficient lighting such as fluorescent or LED bulbs, providing approximately 1 watt per 1.11 square meters.",
                        "Ensure lights are mounted evenly to prevent dark spots, and maintain them by cleaning and replacing bulbs regularly.",
                    ]} />

                    <SubHeading title="Ventilation" />
                    <BulletList items={[
                        "The broiler house should have an open-sided design with partly solid sidewalls (25 – 50 cm high) and upper sections made of chicken mesh wire.",
                        "The pitched, insulated corrugated iron roof helps reduce heat buildup by allowing hot air to rise.",
                        "Ventilation is enhanced with roof nook vents or slanted roofs.",
                        "Adjustable curtains or vents opening from top to bottom regulate airflow and temperature while preventing chilling drafts.",
                        "Fresh air must be available without drafts at chick level, maintaining oxygen, carbon dioxide, and moisture balance to keep chicks healthy and litter dry.",
                    ]} />

                    <SubHeading title="Temperature Control" />
                    <BulletList items={[
                        "Arrange brooders centrally to evenly distribute heat, allowing chicks to move toward or away from the heat source to regulate body temperature.",
                        "Use reliable thermometers at chick height to monitor the temperature.",
                        "Prepare backup power sources if needed.",
                    ]} />
                </SectionCard>

                {/* 3. Chick Collection Guidelines */}
                <SectionCard
                    index={3}
                    title="Chick Collection Guidelines"
                    sectionRef={(el) => { sectionRefs.current[2] = el }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        By taking the following steps one can ensure the health, vitality, and survival of day-old chicks
                        during the critical collection and initial transportation phase:
                    </p>
                    <BulletList items={[
                        "Collect chicks early in the morning when temperatures are cooler to reduce heat stress and dehydration during transport. Avoid collecting them in the heat of the day to minimise mortality risks.",
                        "Inspect the chicks immediately upon receipt for quality. Check that they are alert, active, standing, have healed navels, and show no deformities or abnormalities.",
                        "Count the number of chicks to confirm the correct delivery quantity.",
                        "Transport chicks carefully to minimise movement and heat stress, maintaining below 25°C, allowing air circulation but avoiding drafts or direct sun exposure.",
                        "Do not leave chicks unattended in vehicles or exposed to harsh environmental conditions.",
                        "Place chicks gently and quickly into the prepared brooder to reduce stress.",
                        "Provide immediate access to fresh, clean water upon arrival to avoid dehydration.",
                    ]} />
                </SectionCard>

                {/* 4. Key Preparations */}
                <SectionCard
                    index={4}
                    title="Key Preparations for Placing a New Flock"
                    sectionRef={(el) => { sectionRefs.current[3] = el }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        To establish a healthy environment critical for chick survival, growth, and productivity in the
                        crucial first days of life, one must:
                    </p>

                    <SubHeading title="Thoroughly Clean and Disinfect the House" />
                    <BulletList items={[
                        "Remove all litter, droppings, dust, and debris of the previous flock.",
                        "Clean surfaces with soap/detergent and high-pressure washing.",
                        "Disinfect the house using approved disinfectants, following the manufacturer's instructions for dilution and contact time.",
                        "Allow the house to dry completely and remain empty for at least 10 days before introducing new chicks to minimise disease risk.",
                    ]} />

                    <SubHeading title="Brooder House Preparation and Heating" />
                    <BulletList items={[
                        "Repair any structural damages and seal gaps to prevent drafts and water leaks.",
                        "Use high-quality, dry bedding (5 – 7 cm wood shavings or 10 – 15 cm hay/chopped grass) to keep chicks comfortable and insulated.",
                        "Preheat the brooder house to 30 – 32°C about 24 hours before arrival in summer, or 48 hours in winter.",
                    ]} />

                    <SubHeading title="Equipment Readiness" />
                    <BulletList items={[
                        "Clean and disinfect feeders and drinkers; fill feeders with starter feed and drinkers with fresh water before chick arrival.",
                        "Check heating systems.",
                    ]} />
                </SectionCard>

                {/* 5. Essential Brooding Practices */}
                <SectionCard
                    index={5}
                    title="Essential Brooding Practices"
                    sectionRef={(el) => { sectionRefs.current[4] = el }}
                >
                    <BulletList items={[
                        "Maintain optimal temperature: Keep brooding area at 30°C – 32°C during the first week, gradually lowering as chicks grow. Avoid drafts; monitor temperature at chick level with thermometers.",
                        "Provide clean, fresh water and quality feed immediately upon chick arrival.",
                        "Ensure good ventilation and air quality, preventing harmful gases and drafts.",
                        "Use appropriate bedding: Clean, dry, comfortable litter such as wood shavings or hay. Ensure that it is turned daily.",
                        "Monitor chick behaviour regularly; signs like huddling or panting indicate temperature or comfort issues.",
                        "Provide adequate lighting: Bright initially to help chicks find feed and water, gradually dimmed to establish day/night rhythm.",
                        "Use brooder guards to keep chicks near heat sources and feeding areas in early days, reducing wandering and stress.",
                        "Maintain farm cleanliness by regularly cleaning feeders, drinkers, and litter to reduce disease risk.",
                        "Check crop fills after 24 hours; most chicks should have full crops, indicating successful feeding.",
                    ]} />

                    <SubHeading title="Benefits of Effective Brooding Practices" />
                    <BulletList items={[
                        "Ensure optimal growth conditions during critical early life stages.",
                        "Promote healthy skeletal and cardiovascular system development.",
                        "Stimulate a good appetite and encourage adequate water intake for nutrition.",
                        "Strengthen the immune system, increasing disease resilience.",
                        "Reduce stress levels, improving wellbeing and productivity.",
                        "Set a strong foundation for raising vigorous, healthy poultry flocks.",
                    ]} />

                    <SubHeading title="Temperature Guidelines" />
                    <BulletList items={[
                        "Preheat brooding area to around 33°C before new flock arrival.",
                        "Maintain these gradual temperature reductions as chicks age:",
                    ]} />
                    <DataTable
                        headers={["Age in Days", "Humidity (%)", "Young Flock <30 Weeks", "Older Flock >30 Weeks"]}
                        rows={[
                            ["0", "40 – 60", "34°C", "32°C"],
                            ["7", "40 – 60", "31°C", "30°C"],
                            ["14", "40 – 60", "27°C", "27°C"],
                            ["21", "50 – 70", "24°C", "24°C"],
                            ["28", "50 – 70", "21°C", "21°C"],
                            ["35", "50 – 70", "19°C", "19°C"],
                            ["42", "—", "18°C", "18°C"],
                        ]}
                    />
                    <div className="mt-4">
                        <BulletList items={[
                            "Concrete floor temperature upon placement should be 28°C; bedding slightly warmer (30 – 32°C).",
                            "Under brooders or heat sources, temperature can reach 41°C, but chicks must be able to move away to avoid overheating.",
                            "Supplementary heating is typically stopped by 5 – 6 weeks when chicks are fully feathered.",
                            "Use reliable thermometers at chick head level.",
                        ]} />
                    </div>

                    <SubHeading title="Ventilation Guidelines" />
                    <BulletList items={[
                        "Maintain steady airflow, providing fresh air rich in oxygen.",
                        "Avoid drafts at the chick level to prevent chilling and stress.",
                        "Control airflow using adjustable curtains or vents to maintain temperature and air quality.",
                        "Proper ventilation prevents harmful gas buildup, like ammonia, and moisture accumulation.",
                    ]} />

                    <SubHeading title="Lighting Guidelines" />
                    <BulletList items={[
                        "During the first week light intensity should be 40 to 60 watts of light per 20 square meters, spread evenly across the brooding area.",
                        "Avoid exposing chicks to direct sunlight inside housing to prevent increased aggression.",
                        "Use intermittent lighting program as per the table below.",
                    ]} />
                    <DataTable
                        headers={["Age in Days", "Hours of Dark", "Hours of Light"]}
                        rows={[
                            ["0 – 7", "1", "23 (30 Lux)"],
                            ["8 – 28", "6", "—"],
                            ["29 to Slaughter", "1", "13 (10 Lux)"],
                        ]}
                    />

                    <SubHeading title="Feeding Guidelines" />
                    <BulletList items={[
                        "Always ensure fresh, clean water is available; chicks need about 2 grams of water for every 1 gram of feed.",
                        "During the first 3 – 5 days, add liquid glucose for energy, liquid paraffin for digestion, and vitamins to the water to support health and stress.",
                        "Avoid placing feed or water directly under heat sources to prevent reduced intake.",
                        "Starter feed should be in crumble form to encourage intake; subsequent feeds can be pellets.",
                        "Monitor feed intake and body weight weekly to adjust feed types and amounts as needed for growth performance.",
                        "Aim to have broilers ready for market between 35 to 42 days at around 2 kg live weight.",
                    ]} />
                    <DataTable
                        headers={["Day", "Feed", "kg / Chick"]}
                        rows={[
                            ["1 – 10", "Starter", "0.5 kg"],
                            ["11 – 22", "Grower", "1 kg"],
                            ["22 – 35", "Finisher", "2 kg"],
                        ]}
                    />

                    <SubHeading title="Crop Fill Test" />
                    <BulletList items={[
                        "The crop fill test is a method used to assess whether broiler chicks have successfully found and consumed feed and water after placement.",
                        "It involves gently feeling the crop (a small pouch in the chick's neck where food and water are temporarily stored) using the thumb and forefinger. The test is typically done at intervals such as 2, 8, 12, 24, and 48 hours after arrival to check appetite development.",
                    ]} />
                    <div className="mt-3 p-4 rounded-lg border bg-muted/20">
                        <p className="text-xs font-semibold text-foreground mb-2">Key points in conducting the crop fill test:</p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                            <li>— Gently palpate the crop to feel its content.</li>
                            <li>— Crop content categories:</li>
                            <li className="pl-4">Full, soft, and rounded: chicks have found feed and water.</li>
                            <li className="pl-4">Full but hard: chicks have feed but little or no water.</li>
                            <li className="pl-4">Empty: chicks have not located feed or water.</li>
                        </ul>
                    </div>
                    <div className="mt-4">
                        <BulletList items={[
                            "Calculate the percentage of chicks with a full crop to evaluate feeding success.",
                            "Aiming for close to 100% crop fill by 48 hours is ideal for optimal growth and health.",
                            "This test helps identify feeding or water supply problems early so corrective actions can be taken to improve chick performance.",
                            "The crop test is a critical early management tool to ensure chicks are eating and drinking properly for better growth outcomes in broiler production.",
                        ]} />
                    </div>

                    <SubHeading title="Targeted Weights" />
                    <BulletList items={[
                        "At 7 days old, chicks should weigh about 4 times their day-old weight (e.g., from ~40g at day 0 to ~160g).",
                        "By 35 days (5 weeks), chicks typically reach a market weight of 1.5 to 2.0 kg with proper management.",
                        "Weight progression depends on good feed intake and health in early days; each gram gained at 7 days corresponds roughly to 10 grams by 35 days.",
                        "Monitoring these targets helps farmers ensure optimal flock growth and intervene if weights fall below benchmarks.",
                    ]} />
                    <DataTable
                        headers={["Day", "0", "7", "14", "21", "28", "35"]}
                        rows={[["Weight", "44 g", "181 g", "477 g", "935 g", "1,524 g", "2,196 g"]]}
                    />
                </SectionCard>

                {/* 6. Biosecurity */}
                <SectionCard
                    index={6}
                    title="Biosecurity: Protecting Your Flock from Disease"
                    sectionRef={(el) => { sectionRefs.current[5] = el }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Biosecurity includes essential practices to protect your poultry flock from viruses, bacteria,
                        and parasites, ensuring health and profitability.
                    </p>

                    <SubHeading title="The Importance of Biosecurity" />
                    <BulletList items={[
                        "Prevents the introduction and spread of infectious diseases.",
                        "Minimises mortality and reduces medication costs.",
                        "Ensures healthy chicks for improved growth and production.",
                        "Protects public health by reducing zoonotic disease risk.",
                        "Supports compliance with poultry health regulations.",
                    ]} />

                    <SubHeading title="Key Biosecurity Measures" />
                    <BulletList items={[
                        "Access Control: Restrict poultry house entry to essential personnel; minimise visitors; provide disinfectant footbaths; use dedicated clothing and footwear.",
                        "Farm and House Hygiene: Clean and disinfect houses before new flocks; remove litter and droppings; keep surroundings tidy; trim bushes and grass.",
                        "Dead Chicks Disposal: Remove and dispose of dead chicks promptly and safely (deep burial or incineration).",
                        "Feeding and Watering Equipment: Use clean, dedicated feeders and drinkers per flock; disinfect regularly; provide uncontaminated water refreshed multiple times daily.",
                        "Pest and Wildlife Control: Prevent access of wild birds, rodents, cats, dogs, and insects; seal building gaps.",
                        "Vehicle and Equipment Hygiene: Disinfect vehicles and equipment before farm entry; avoid sharing unless sanitised.",
                        "Employee Training: Train workers on biosecurity protocols; enforce strict hygiene practices.",
                    ]} />
                </SectionCard>

                {/* 7. Vaccinations */}
                <SectionCard
                    index={7}
                    title="Vaccinations: Protecting Your Flock for Healthy Growth"
                    sectionRef={(el) => { sectionRefs.current[6] = el }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Vaccinations safeguard chicks against common, potentially devastating diseases and support flock
                        immunity and productivity.
                    </p>

                    <SubHeading title="Why Vaccination Is Important" />
                    <BulletList items={[
                        "Protects against Marek's disease, Newcastle disease, Infectious Bronchitis, Infectious Bursal Disease (Gumboro), and others.",
                        "Reduces the need for antibiotics by preventing outbreaks.",
                        "Supports uniform growth and immune strength.",
                        "Ensures compliance with health and market requirements.",
                    ]} />

                    <SubHeading title="2026 Broiler Vaccination Schedule" />
                    <DataTable
                        headers={["Age", "Vaccine", "Administration", "Trade Name", "Supplier"]}
                        rows={[
                            ["DOC (Hatchery)", "IB", "Spray", "IB 4/91", "MSD"],
                            ["DOC (Hatchery)", "ND", "Spray", "ND C2", "MSD"],
                            ["DOC (Hatchery)", "IBD", "Spray", "UNIVAX BD", "MSD"],
                            ["Day 14", "IBD", "Water", "GUMBORO D78", "MSD"],
                            ["Day 14", "ND & IB", "Water", "MAS5+CLONE 30", "MSD"],
                            ["Day 21", "IBD", "Water", "GUMBORO D78", "MSD"],
                            ["Day 21", "MAS5+CLONE 30", "Water", "MAS5+CLONE 30", "MSD"],
                        ]}
                    />

                    <SubHeading title="Key Vaccination Points" />
                    <BulletList items={[
                        "Administer vaccines on schedule to avoid maternal antibody interference.",
                        "Use correct methods and dosages; vaccination should be done by trained personnel.",
                        "Maintain hygiene to prevent contamination or disease spread.",
                        "Monitor flock post-vaccination and provide proper nutrition and care.",
                        "Store vaccines properly; avoid vaccinating sick or weak chicks.",
                        "Use clean, chlorine-free water for drinking-water vaccines; vaccinate during cooler parts of the day.",
                    ]} />
                </SectionCard>

                {/* Disclaimer */}
                <div className="rounded-xl border border-yellow-200 dark:border-yellow-800/30 bg-yellow-50 dark:bg-yellow-950/20 p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">!</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Important Notice</h3>
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                                This guide provides general brooding principles for Ross 308 broiler chicks. Always follow
                                any breed-specific or hatchery-provided guidelines supplied at the time of chick collection,
                                as these take precedence for your specific stock and conditions.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
