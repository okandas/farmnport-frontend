"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { querySeriesSummary, querySeriesChart, querySeriesBuyers, queryMarketNews } from "@/lib/query"
import { makeAbbveriation, slug } from "@/lib/utilities"
import { PriceChart } from "@/components/structures/price-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"

const toDollars = (v: number) => (v / 100).toFixed(2)

/* ── Slaughter grade codes — everything else is farm/breeding ── */
const slaughterCodes = new Set([
  "S", "C", "E", "M", "J", "X", "MT", "2T", "4T", "6T",
  "1", "3", "4", "5", "S3", "CD",
  "INFH", "INFST",
])
function isSlaughterGrade(code: string, category: string): boolean {
  if (["BEEF", "PORK", "CHICKEN", "CHICKENS", "LAMB", "MUTTON", "GOAT"].includes(category)) return true
  return slaughterCodes.has(code.toUpperCase())
}

/* ── Grade descriptions for SEO content ── */
const gradeDescriptions: Record<string, { title: string; description: string }> = {
  // Cattle slaughter grades
  "CATTLE:S": { title: "What is Super Grade Cattle?", description: "Super grade cattle represent the highest quality carcasses in the Zimbabwean grading system. These animals are young, well-finished with excellent fat cover and superior meat quality. Super grade commands the highest price per kilogram and is sought after by premium butcheries and restaurants for its tenderness, marbling and consistent eating quality." },
  "CATTLE:C": { title: "What is Commercial Grade Cattle?", description: "Commercial grade cattle are well-finished animals that meet standard market requirements. They have adequate fat cover and good conformation, making them the most commonly traded grade at livestock auctions across Zimbabwe. Commercial grade offers a strong balance between quality and value, suitable for wholesale meat distribution and retail butcheries." },
  "CATTLE:E": { title: "What is Economy Grade Cattle?", description: "Economy grade cattle have less finish and fat cover than commercial grade. These animals are typically lighter or have been on poorer grazing. Economy grade is popular with value-focused buyers and processors who need affordable raw material. While leaner, economy grade beef is widely used in processed meat products and budget retail." },
  "CATTLE:M": { title: "What is Manufacturing Grade Cattle?", description: "Manufacturing grade cattle are the lowest slaughter grade, typically older or poorly conditioned animals. This grade is used primarily by meat processing plants for products like polony, sausages and canned meat. Manufacturing grade offers the lowest price per kilogram but provides essential raw material for Zimbabwe's processed meat industry." },
  "CATTLE:J": { title: "What is Manufacturing (J) Grade Cattle?", description: "J grade is the manufacturing classification used in the cold dress mass (CDM) grading system. These are cattle with minimal fat cover and poor conformation, destined for meat processing rather than fresh retail. J grade carcasses are typically used for ground beef, sausages and other value-added meat products." },
  "CATTLE:X": { title: "What is Economy (X) Grade Cattle?", description: "X grade cattle fall under the economy classification in the CDM grading system. These animals have below-average finish but are still suitable for slaughter. X grade is commonly purchased by processors and budget-focused buyers looking for affordable beef at auction." },

  // Cattle feeder/stocker grades
  "CATTLE:FS": { title: "What are Feeder Steers?", description: "Feeder steers are young castrated male cattle purchased specifically for fattening before slaughter. These animals typically weigh between 250 and 350 kg and are placed on feedlots or improved pasture to gain weight and finish. Feeder steers are a key investment for livestock fattening operations, with profit dependent on the spread between purchase price and final slaughter value." },
  "CATTLE:FC": { title: "What are Feeder Cows?", description: "Feeder cows are female cattle purchased for fattening before slaughter. These are typically older cows past their breeding prime that still have potential to gain weight and improve their carcass grade. Feeder cows offer a lower entry price compared to steers and can be profitable when feed costs are managed carefully." },
  "CATTLE:FB": { title: "What are Feeder Bulls?", description: "Feeder bulls are young intact male cattle purchased for fattening. Bulls grow faster than steers due to natural testosterone but may produce tougher meat. They are typically purchased by feedlot operators who can manage them in dedicated pens and benefit from their superior feed conversion rates." },

  // Breeding stock
  "CATTLE:BB": { title: "What are Breeding Bulls?", description: "Breeding bulls are mature, fertile male cattle sold for herd improvement and reproduction. A good breeding bull can service 25 to 40 cows per season and has a direct impact on calf quality, growth rates and herd genetics. Breeding bulls command premium prices based on their breed, conformation, fertility testing results and genetic potential." },
  "CATTLE:BC": { title: "What are Breeding Cows?", description: "Breeding cows are proven female cattle sold for their reproductive value. These animals have a track record of successful calving and are purchased to build or expand a breeding herd. Buyers look for good body condition, sound udders, proven fertility and breed characteristics. Breeding cows are priced per head rather than per kilogram." },
  "CATTLE:BCC": { title: "What is a Cow and Calf Unit?", description: "A cow and calf unit is a breeding cow sold together with her suckling calf. This is one of the most popular purchases for farmers starting or expanding a herd, as the buyer gets an immediately productive animal plus a young calf already on the ground. Cow and calf units are priced per head and typically command a premium over dry cows." },
  "CATTLE:BH": { title: "What are Bulling Heifers?", description: "Bulling heifers are young female cattle that have reached breeding age (typically 18 to 24 months) but have not yet calved. They are purchased by farmers looking to grow their breeding herds with young, productive animals. Bulling heifers offer the advantage of many years of breeding ahead and the buyer can select the bull for their first mating." },
  "CATTLE:BULL": { title: "What are Bulls at Auction?", description: "Bulls sold at livestock auction are intact male cattle of various ages and breeds. They may be sold for breeding purposes or for slaughter depending on their age, condition and conformation. Buyers evaluate bulls based on breed standards, structural soundness, temperament and intended use." },

  // Weaner grades
  "CATTLE:W-L/WH": { title: "What are Weaner to Long Weaner Heifers?", description: "Weaner to long weaner heifers are young female cattle recently separated from their mothers, typically between 6 and 12 months of age and weighing 180 to 250 kg. These animals represent one of the highest value-per-kilogram categories because of their growth potential. Buyers purchase them for backgrounding on pasture before either entering a feedlot or joining a breeding herd. Their lighter weight means lower total outlay per animal, making them accessible to smaller-scale farmers." },
  "CATTLE:W-L/WST": { title: "What are Weaner to Long Weaner Steers?", description: "Weaner to long weaner steers are young castrated male cattle between 6 and 12 months old, typically weighing 180 to 250 kg. They are among the most actively traded categories at Zimbabwean livestock auctions. Buyers purchase them to grow out on pasture or place on feedlots for finishing. Weaner steers offer excellent growth potential and are priced per kilogram based on weight and condition at sale." },
  "CATTLE:WH": { title: "What are Weaner Heifers?", description: "Weaner heifers are young female cattle that have just been weaned, typically 6 to 8 months old. They are lighter than long weaners and are purchased for growing out on pasture. Weaner heifers can be raised as replacement breeding stock or fattened for eventual slaughter, giving the buyer flexibility in their farming operation." },

  // Inferior grades
  "CATTLE:INFH": { title: "What are Inferior Heifers?", description: "Inferior heifers are young female cattle that do not meet the standard for higher grades due to poor condition, conformation or health issues. They are typically lighter, thinner animals that may have come off poor grazing. Despite the lower grade, inferior heifers can be profitable purchases for experienced farmers who can rehabilitate them on good pasture before resale or slaughter." },
  "CATTLE:INFST": { title: "What are Inferior Steers?", description: "Inferior steers are castrated male cattle graded below the standard feeder or commercial categories. These animals are typically underweight or in poor body condition. They represent a value buying opportunity for farmers with access to good grazing or feedlot capacity, as the price discount can translate to strong margins once the animals are rehabilitated and finished." },

  // Teeth-based grades (CDM liveweight)
  "CATTLE:MT": { title: "What are Milk Teeth Cattle?", description: "Milk teeth cattle are young animals under 2 years of age that still have all their baby (deciduous) teeth. This is the youngest age classification in the liveweight grading system. Milk teeth cattle produce the most tender beef and are highly valued by buyers seeking premium young beef for the fresh meat market." },
  "CATTLE:2T": { title: "What are 2 Teeth Cattle?", description: "Two teeth cattle are approximately 2 to 2.5 years old, identified by having their first pair of permanent incisors. This age class produces tender, well-flavoured beef and is popular at auction. Two teeth cattle are young enough to produce quality meat while having had time to develop good muscle mass." },
  "CATTLE:4T": { title: "What are 4 Teeth Cattle?", description: "Four teeth cattle are approximately 2.5 to 3 years old with two pairs of permanent incisors. They offer a good balance of maturity and meat quality. Four teeth cattle have had more time to grow and finish compared to younger classes, often resulting in heavier carcasses with adequate fat cover." },
  "CATTLE:6T": { title: "What are 6 Teeth Cattle?", description: "Six teeth cattle are approximately 3 to 3.5 years old with three pairs of permanent incisors. They are approaching full mouth maturity and typically carry more weight. While the meat may be slightly less tender than younger classes, six teeth cattle often provide excellent value as they have had more time to finish on natural grazing." },

  // Sub-grade splits
  "CATTLE:FSA": { title: "What are Feeder Steer A Grade?", description: "Feeder Steer A grade represents the top tier of feeder steers at auction. These are well-grown, well-conditioned young steers with the best frame and muscle development in the feeder category. A grade feeder steers command the highest prices and are expected to finish efficiently in feedlot or on good pasture." },
  "CATTLE:FSB": { title: "What are Feeder Steer B Grade?", description: "Feeder Steer B grade are medium-quality feeder steers with acceptable condition and frame size. They offer good value for buyers who can provide adequate nutrition for finishing. B grade feeder steers are the most commonly traded sub-grade at auction." },
  "CATTLE:FSC": { title: "What are Feeder Steer C Grade?", description: "Feeder Steer C grade are the lowest tier of feeder steers, typically lighter or in poorer condition. They offer the lowest entry price and can be profitable for experienced farmers with low-cost grazing or feed options available." },
  "CATTLE:BHA": { title: "What are Bulling Heifer A Grade?", description: "Bulling Heifer A grade are the top-quality young breeding heifers at auction. They show excellent breed characteristics, good conformation and are in prime breeding condition. A grade bulling heifers are sought after by commercial and stud breeders." },
  "CATTLE:BHB": { title: "What are Bulling Heifer B Grade?", description: "Bulling Heifer B grade are medium-quality breeding heifers suitable for commercial herds. They have acceptable conformation and condition for breeding but may lack the refinement of A grade animals." },
  "CATTLE:BHC": { title: "What are Bulling Heifer C Grade?", description: "Bulling Heifer C grade are the lowest tier of breeding heifers. While still suitable for breeding, they may need additional conditioning before joining a bull. They offer the most affordable entry point into breeding stock." },
  "CATTLE:WHA": { title: "What are Weaner Heifer A Grade?", description: "Weaner Heifer A grade are the best-quality young female weaners at auction. These calves are well-grown with good breed characteristics and represent the highest potential for future growth and breeding value." },
  "CATTLE:WHB": { title: "What are Weaner Heifer B Grade?", description: "Weaner Heifer B grade are medium-quality weaner heifers with acceptable growth and condition. They are commonly purchased for growing out on communal or commercial grazing." },
  "CATTLE:WHC": { title: "What are Weaner Heifer C Grade?", description: "Weaner Heifer C grade are lighter or less developed weaner heifers. They offer lower entry cost but may need more time and better nutrition to reach target weights." },
  "CATTLE:WSA": { title: "What are Weaner Steer A Grade?", description: "Weaner Steer A grade are the top-quality young male weaners at auction. Well-grown with strong frames, these calves are expected to perform well in feedlot or on pasture and command the highest weaner steer prices." },
  "CATTLE:WSB": { title: "What are Weaner Steer B Grade?", description: "Weaner Steer B grade are medium-quality weaner steers suitable for growing out on pasture or feedlot. They represent the bulk of weaner steer sales at most auctions." },
  "CATTLE:WSC": { title: "What are Weaner Steer C Grade?", description: "Weaner Steer C grade are the lightest or least developed weaner steers. They offer value buying opportunities for farmers with access to good low-cost grazing who can grow them out over a longer period." },
  "CATTLE:CH": { title: "What are Commercial Heifers?", description: "Commercial heifers are young female cattle sold for either fattening or breeding at commercial scale. They are graded based on condition, weight and conformation. Commercial heifers that do not meet breeding standards are typically finished for slaughter." },
  "CATTLE:CB": { title: "What are Commercial Bulls?", description: "Commercial bulls are intact male cattle sold at auction for either breeding or slaughter. Unlike stud bulls, commercial bulls are not registered with breed societies but can still serve effectively in commercial herds for crossbreeding programmes." },
  "CATTLE:DAIRY": { title: "What are Dairy Cattle at Auction?", description: "Dairy cattle sold at livestock auctions include dairy cows, heifers and bulls of dairy breeds such as Holstein, Jersey and Ayrshire. They are typically culled from dairy herds due to age, low production or herd management decisions. Dairy cattle at slaughter auctions are usually priced lower per kilogram than beef breeds due to their leaner conformation." },

  // Numeric grades (used in some sale formats)
  "CATTLE:1": { title: "What is Grade 1 Cattle?", description: "Grade 1 cattle represent the highest quality tier in simplified auction grading systems. These are well-finished animals in prime condition with good fat cover and conformation, commanding the best prices at sale." },
  "CATTLE:3": { title: "What is Grade 3 Cattle?", description: "Grade 3 cattle are mid-range quality animals in simplified auction grading. They have acceptable condition and finish but fall below the premium grades. Grade 3 is commonly used at rural and communal area sales." },
  "CATTLE:4": { title: "What is Grade 4 Cattle?", description: "Grade 4 cattle are below-average quality animals, typically thinner or older stock. They are priced accordingly and often purchased by buyers who can rehabilitate the animals on better grazing." },
  "CATTLE:5": { title: "What is Grade 5 Cattle?", description: "Grade 5 cattle are the lowest quality tier, representing very thin, old or poorly conditioned animals. These are typically the most affordable cattle at auction and are purchased by value buyers or for manufacturing purposes." },
  "CATTLE:S3": { title: "What are S3 Grade Cattle?", description: "S3 grade combines slaughter suitability with a grade 3 quality rating. These cattle are suitable for direct slaughter but at a lower quality tier than premium grades. S3 is commonly used at direct slaughter sales in rural areas." },

  // Breed categories — fallback descriptions
  "BORAN:": { title: "What are Boran Cattle?", description: "Boran cattle are a heat-tolerant, tick-resistant breed originating from East Africa. They are prized in Zimbabwe for their hardiness, good mothering ability and ability to thrive on natural grazing in harsh conditions. Boran cattle are increasingly popular with commercial farmers seeking low-input, high-output beef production." },
  "BRAHMAN:": { title: "What are Brahman Cattle?", description: "Brahman cattle are a tropical beef breed known for their distinctive hump, loose skin and heat tolerance. They are widely used in Zimbabwe's hot lowveld regions and in crossbreeding programmes to introduce hardiness and tick resistance into commercial herds." },
  "MASHONA:": { title: "What are Mashona Cattle?", description: "Mashona cattle are a small-framed indigenous Zimbabwean breed known for their exceptional hardiness, fertility and ability to thrive on poor grazing. They are the foundation breed for many communal and small-scale farming operations across Zimbabwe." },
  "TULI:": { title: "What are Tuli Cattle?", description: "Tuli cattle are a Southern African breed developed from indigenous Tswana cattle. They are medium-framed, heat tolerant and known for their docile temperament, early maturity and good beef quality. Tuli cattle are popular in crossbreeding programmes." },
  "BONSMARA:": { title: "What are Bonsmara Cattle?", description: "Bonsmara cattle are a composite breed developed in South Africa from Afrikaner, Hereford and Shorthorn genetics. They combine tropical adaptation with excellent beef characteristics including good growth rates, feed efficiency and carcass quality." },
  "BEEFMASTER:": { title: "What are Beefmaster Cattle?", description: "Beefmaster cattle are a composite American breed combining Brahman, Hereford and Shorthorn genetics. They are selected for six essential traits: weight, conformation, milking ability, fertility, hardiness and disposition. Beefmasters perform well in Zimbabwe's tropical and subtropical conditions." },
  "SIMBRA:": { title: "What are Simbra Cattle?", description: "Simbra cattle are a composite breed crossing Simmental with Brahman genetics. They combine the growth rate and muscling of Simmental with the heat tolerance and hardiness of Brahman, making them well-suited to Zimbabwe's commercial beef industry." },
  "ABERDEEN:": { title: "What are Aberdeen Angus Cattle?", description: "Aberdeen Angus cattle are a British beef breed known for their superior marbling, early maturity and polled (hornless) genetics. Angus beef is internationally recognised for its eating quality. In Zimbabwe, Angus cattle are used in premium beef production and crossbreeding programmes." },
  "NKONE:": { title: "What are Nkone Cattle?", description: "Nkone cattle are an indigenous Zimbabwean breed from the Matabeleland region. They are hardy, well-adapted to local conditions and known for their red colour and medium frame. Nkone cattle are valued for their disease resistance and ability to perform on natural veld." },
  "ANGONI:": { title: "What are Angoni Cattle?", description: "Angoni cattle are a small-framed indigenous breed from Zambia and Malawi that has adapted well to Zimbabwe's conditions. They are known for their hardiness, disease resistance and ability to thrive on poor-quality grazing. Angoni cattle are popular in communal farming areas." },
  "CROSSBREED:": { title: "What are Crossbreed Cattle?", description: "Crossbreed cattle combine genetics from two or more breeds to take advantage of hybrid vigour (heterosis). Crossbreeding typically produces animals with improved growth rates, fertility and disease resistance compared to purebred parents. Common crosses in Zimbabwe include Boran x Brahman, Angus x Brahman and various indigenous breed combinations." },
  "COMMUNAL:": { title: "What are Communal Cattle?", description: "Communal cattle are animals raised in communal farming areas across Zimbabwe. These are typically indigenous or crossbred cattle managed under traditional systems. Communal cattle are graded separately at auction to reflect their varied backgrounds and condition levels." },

  // Boran breed grades
  "BORAN:BORB": { title: "What is a Boran Bull?", description: "A Boran bull is a purebred male Boran used for breeding. Boran bulls are valued for their heat tolerance, tick resistance and ability to pass on hardiness to offspring. They are popular in commercial herds across Zimbabwe's hot lowveld and middleveld regions. A good Boran bull combines breed character with strong fertility and structural soundness." },
  "BORAN:BORH": { title: "What is a Boran Heifer?", description: "A Boran heifer is a young purebred female Boran that has not yet calved. Boran heifers are purchased as replacement breeding stock, valued for their breed's exceptional mothering ability, fertility and low-maintenance characteristics. They mature early and can be mated from 18 months." },
  "BORAN:BORC": { title: "What is a Boran Cow?", description: "A Boran cow is a proven purebred female Boran with calving history. Boran cows are prized for their fertility, longevity and ability to raise strong calves on natural grazing with minimal supplementation. They are excellent mothers and can remain productive well into their teens." },
  "BORAN:BORCC": { title: "What is a Boran Cow and Calf?", description: "A Boran cow and calf unit is a proven Boran cow sold with her suckling calf at foot. This is a premium purchase that gives the buyer an immediately productive breeding animal plus a young calf. Boran cows are known for their strong maternal instincts and excellent milk production for calf rearing." },
  "BORAN:BOCIC": { title: "What is a Boran Cow in Calf?", description: "A Boran cow in calf is a pregnant Boran cow confirmed to be carrying a calf. This is a valuable purchase as the buyer gets a proven breeder with a calf on the way. The pregnancy status adds significant value over a dry cow." },
  "BORAN:BOHIC": { title: "What is a Boran Heifer in Calf?", description: "A Boran heifer in calf is a young Boran female that is pregnant with her first calf. This represents excellent value as the buyer gets a young animal with many breeding years ahead, already confirmed pregnant. First-calf Boran heifers typically calve easily due to the breed's moderate birth weights." },
  "BORAN:PBORC": { title: "What is a Pregnant Boran Cow?", description: "A pregnant Boran cow is a proven breeder confirmed in calf at the time of sale. Pregnancy-tested cows command a premium over dry cows because the buyer has certainty of an upcoming calf. Boran cows are known for easy calving and strong calf survival rates." },
  "BORAN:PBORCC": { title: "What is a Pregnant Boran Cow and Calf?", description: "A pregnant Boran cow and calf is a cow sold with a calf at foot while also carrying another calf. This is the highest-value breeding unit as the buyer gets three animals in one purchase — a proven cow, a weaner calf and an unborn calf." },
  "BORAN:PG BORC": { title: "What is a Progeny Boran Cow?", description: "A progeny Boran cow is sold as part of a progeny group, meaning she is the offspring of a specific sire. Progeny sales allow buyers to evaluate the genetic merit of a bull through his daughters' performance, conformation and breed character." },
  "BORAN:PG BORCC": { title: "What is a Progeny Boran Cow and Calf?", description: "A progeny Boran cow and calf is a sire's daughter sold with her calf, demonstrating the bull's breeding value through both his daughter and her offspring. This gives buyers direct evidence of genetic quality across two generations." },
  "BORAN:PG BORH": { title: "What is a Progeny Boran Heifer?", description: "A progeny Boran heifer is a young female sold as part of a progeny group from a specific sire. Buyers can assess the sire's genetic contribution through his daughters' conformation, temperament and breed character before purchasing." },

  // Brahman breed grades
  "BRAHMAN:BRAB": { title: "What is a Brahman Bull?", description: "A Brahman bull is a purebred male Brahman used for breeding. Brahman bulls are distinguished by their large hump, loose skin and pendulous sheath. They are valued for introducing heat tolerance, tick resistance and hybrid vigour when crossed with British and European breeds." },
  "BRAHMAN:BRAH": { title: "What is a Brahman Heifer?", description: "A Brahman heifer is a young purebred female Brahman of breeding age. Brahman heifers are purchased for their breed's tropical adaptation and strong crossbreeding potential. They are known for their longevity and ability to produce quality calves over many years." },
  "BRAHMAN:BRAHB": { title: "What is a Brahman Bull B Grade?", description: "A Brahman Bull B grade is a second-tier Brahman bull at auction. While not meeting the top standard, B grade Brahman bulls can still serve effectively in commercial herds and offer good value for farmers who do not need stud-quality genetics." },
  "BRAHMAN:BRAHC": { title: "What is a Brahman Cow?", description: "A Brahman cow is a proven female Brahman with calving history. Brahman cows are exceptional mothers, known for their protective instincts, good milk production and ability to raise healthy calves in harsh tropical conditions." },
  "BRAHMAN:BRAHCC": { title: "What is a Brahman Cow and Calf?", description: "A Brahman cow and calf unit is a proven Brahman cow sold with her suckling calf. Brahman cows are renowned for their maternal ability and protective nature. The calf benefits from the breed's hybrid vigour potential in future crossbreeding." },
  "BRAHMAN:BRAHH": { title: "What is a Brahman Heifer H Grade?", description: "A Brahman Heifer H grade is a breeding-quality Brahman heifer graded within the heifer classification. These young females are suitable for joining a breeding herd and carry the Brahman breed's valued tropical adaptation traits." },
  "BRAHMAN:PG BRAH": { title: "What is a Progeny Brahman Heifer?", description: "A progeny Brahman heifer is a young female sold as part of a progeny group from a specific Brahman sire. This allows buyers to evaluate the bull's breeding merit through his daughters' conformation and breed character." },
  "BRAHMAN:RBRAH": { title: "What is a Registered Brahman Cow?", description: "A registered Brahman cow is a purebred female recorded in the Brahman breed society herd book. Registered animals have verified pedigrees and carry a premium over commercial Brahmans. They are purchased by stud breeders and farmers wanting traceable genetics." },

  // Mashona breed grades
  "MASHONA:MASHB": { title: "What is a Mashona Bull?", description: "A Mashona bull is a purebred indigenous Zimbabwean male used for breeding. Mashona bulls are compact, hardy and well-adapted to local diseases and parasites. They are popular in communal and small-scale farming operations for their low-maintenance requirements and reliable fertility." },
  "MASHONA:MASHH": { title: "What is a Mashona Heifer?", description: "A Mashona heifer is a young purebred indigenous female of breeding age. Mashona heifers are valued for their hardiness, fertility and ability to calve without assistance. They are an affordable entry point into cattle breeding for small-scale farmers." },
  "MASHONA:PG MASHH": { title: "What is a Progeny Mashona Heifer?", description: "A progeny Mashona heifer is a young female from a specific Mashona sire, sold to demonstrate the bull's breeding value. Progeny heifers allow buyers to assess genetic quality before purchasing breeding stock." },

  // Tuli breed grades
  "TULI:TULB": { title: "What is a Tuli Bull?", description: "A Tuli bull is a purebred male from the Tuli breed, developed in southern Africa from indigenous Tswana cattle. Tuli bulls are known for their docile temperament, early maturity and ability to produce well-muscled, tender beef. They are popular in crossbreeding programmes to improve meat quality and temperament." },
  "TULI:TULH": { title: "What is a Tuli Heifer?", description: "A Tuli heifer is a young purebred female Tuli of breeding age. Tuli heifers are valued for their early maturity, good fertility and the breed's reputation for producing tender, well-marbled beef. They calve easily due to moderate calf birth weights." },
  "TULI:TULIB": { title: "What is a Tuli Bull in Calf?", description: "A Tuli bull in calf refers to a Tuli breeding lot where the bull is sold with confirmed pregnant females. This provides the buyer with a complete breeding unit of proven Tuli genetics." },
  "TULI:TULIC": { title: "What is a Tuli Cow in Calf?", description: "A Tuli cow in calf is a pregnant Tuli cow confirmed to be carrying. Tuli cows are known for easy calving, good milk production and excellent mothering ability, making pregnant Tuli cows a valuable breeding purchase." },
  "TULI:TULICC": { title: "What is a Tuli Cow and Calf in Calf?", description: "A Tuli cow and calf in calf is a cow sold with a suckling calf while also confirmed pregnant with another. This is the highest-value Tuli breeding unit, giving the buyer three animals and immediate productivity." },
  "TULI:TULIH": { title: "What is a Tuli Heifer in Calf?", description: "A Tuli heifer in calf is a young Tuli female pregnant with her first calf. This combines the value of a young breeding animal with many productive years ahead and the certainty of an upcoming calf." },
  "TULI:TULIHC": { title: "What is a Tuli Heifer Calf?", description: "A Tuli heifer calf is a very young female Tuli, typically recently weaned. Purchasing heifer calves offers the lowest entry price into Tuli genetics, though the buyer must invest in rearing the animal to breeding age." },

  // Bonsmara breed grades
  "BONSMARA:BONSH": { title: "What is a Bonsmara Heifer?", description: "A Bonsmara heifer is a young female from the Bonsmara composite breed. Bonsmara heifers combine tropical adaptation from Afrikaner genetics with the growth and carcass quality of Hereford and Shorthorn. They are sought after for commercial breeding herds." },

  // Beefmaster breed grades
  "BEEFMASTER:BMB": { title: "What is a Beefmaster Bull?", description: "A Beefmaster bull is a purebred male from the Beefmaster composite breed. Beefmaster bulls are selected on six essential traits — weight, conformation, milking ability, fertility, hardiness and disposition. They are used in commercial herds to produce fast-growing, well-tempered calves." },
  "BEEFMASTER:BMH": { title: "What is a Beefmaster Heifer?", description: "A Beefmaster heifer is a young female Beefmaster of breeding age. Beefmaster heifers are valued for the breed's balanced selection approach and their ability to produce calves with excellent growth rates and docile temperament." },

  // Simbra breed grades
  "SIMBRA:SIMB": { title: "What is a Simbra Bull?", description: "A Simbra bull is a composite male crossing Simmental with Brahman genetics. Simbra bulls combine the muscling and growth rate of Simmental with the heat tolerance and tick resistance of Brahman, making them ideal sires for Zimbabwe's commercial beef herds." },
  "SIMBRA:SIMH": { title: "What is a Simbra Heifer?", description: "A Simbra heifer is a young female from the Simbra composite breed. These heifers offer a blend of Simmental growth potential and Brahman hardiness, making them versatile breeding females for tropical and subtropical conditions." },
  "SIMBRA:SIMBB": { title: "What is a Simbra Bull B Grade?", description: "A Simbra Bull B grade is a second-tier Simbra bull at auction. While not meeting the top standard, B grade Simbra bulls still carry valuable composite genetics and can serve effectively in commercial breeding programmes." },
  "SIMBRA:SIMBH": { title: "What is a Simbra Heifer H Grade?", description: "A Simbra Heifer H grade is a breeding-quality Simbra heifer graded within the heifer classification. These young females carry the Simbra breed's valued combination of growth and hardiness traits." },
  "SIMBRA:PG SIMH": { title: "What is a Progeny Simbra Heifer?", description: "A progeny Simbra heifer is a young female sold as part of a progeny group from a specific Simbra sire. This allows buyers to assess the sire's breeding merit through his daughters." },
  "SIMBRA:SIMMB": { title: "What is a Simmental Bull?", description: "A Simmental bull sold under the Simbra category is a purebred Simmental male. Simmental is one of the oldest and most widely distributed cattle breeds, known for exceptional growth rates, heavy muscling and high milk production. They are used to add size and growth to Zimbabwean herds." },

  // Aberdeen breed grades
  "ABERDEEN:ABH": { title: "What is an Aberdeen Angus Heifer?", description: "An Aberdeen Angus heifer is a young purebred female Angus of breeding age. Angus heifers are valued for their early maturity, ease of calving, natural polling (no horns) and the breed's world-renowned marbling and beef quality. They are popular in premium beef production programmes." },

  // Nkone breed grades
  "NKONE:NKB": { title: "What is a Nkone Bull?", description: "A Nkone bull is a purebred male from the indigenous Nkone breed of Matabeleland. Nkone bulls are hardy, disease-resistant and well-adapted to Zimbabwe's natural veld conditions. They are used in breeding programmes focused on indigenous genetics and sustainable low-input farming." },
  "NKONE:NKH": { title: "What is a Nkone Heifer?", description: "A Nkone heifer is a young purebred female Nkone of breeding age. Nkone heifers are valued for their indigenous hardiness, fertility and ability to thrive on natural grazing without supplementation." },
  "NKONE:NKCC": { title: "What is a Nkone Cow and Calf?", description: "A Nkone cow and calf is a proven Nkone cow sold with her suckling calf. This gives the buyer an immediately productive indigenous breeding unit with strong natural disease resistance and adaptation to local conditions." },
  "NKONE:NKOB": { title: "What is a Nkone Old Bull?", description: "A Nkone old bull is an older Nkone male past his prime breeding years. Old bulls are typically sold for slaughter or to smaller herds where their proven genetics still have value despite advancing age." },
  "NKONE:PG NKC": { title: "What is a Progeny Nkone Cow?", description: "A progeny Nkone cow is a proven female sold as part of a progeny group from a specific Nkone sire. This allows buyers to evaluate the bull's genetic contribution through his daughters' production records." },
  "NKONE:PG NKH": { title: "What is a Progeny Nkone Heifer?", description: "A progeny Nkone heifer is a young female from a specific Nkone sire, sold to demonstrate the bull's breeding value through his daughters' conformation and breed character." },

  // Angoni breed grades
  "ANGONI:ANGB": { title: "What is an Angoni Bull?", description: "An Angoni bull is a purebred male from the indigenous Angoni breed. Angoni bulls are compact, hardy and well-adapted to harsh conditions. They are used in communal and small-scale herds where low-maintenance, disease-resistant genetics are essential." },
  "ANGONI:ANGH": { title: "What is an Angoni Heifer?", description: "An Angoni heifer is a young purebred female Angoni of breeding age. Angoni heifers are valued for their hardiness, fertility and ability to produce calves with minimal veterinary intervention in challenging environments." },

  // Crossbreed grades
  "CROSSBREED:BORBRABH": { title: "What is a Boran Brahman Heifer?", description: "A Boran Brahman heifer is a crossbreed female combining Boran and Brahman genetics. This cross produces exceptionally heat-tolerant, tick-resistant animals with strong hybrid vigour. The combination of two tropical breeds results in heifers well-suited to Zimbabwe's lowveld conditions." },
  "CROSSBREED:BORWH": { title: "What is a Boran Wangus Heifer?", description: "A Boran Wangus heifer is a cross between Boran and Angus (Wangus) genetics. This combination blends Boran hardiness and heat tolerance with Angus marbling and meat quality, producing a versatile female for commercial beef production." },
  "CROSSBREED:PBORH": { title: "What is a Progeny Boran Cross Heifer?", description: "A progeny Boran cross heifer is a crossbred female from a specific Boran sire, sold as part of a progeny group. This demonstrates the sire's ability to produce quality crossbred offspring." },
  "CROSSBREED:RBRCIC": { title: "What is a Registered Boran Brahman Cross?", description: "A registered Boran Brahman cross is a crossbred animal with documented pedigree from both Boran and Brahman breed societies. Registered crosses carry verified genetics and command higher prices than unregistered crossbreeds." },
  "CROSSBREED:WBRAH": { title: "What is a Wangus Brahman Heifer?", description: "A Wangus Brahman heifer crosses Angus (Wangus) with Brahman genetics, combining Angus beef quality with Brahman tropical adaptation. These crossbred heifers exhibit strong hybrid vigour and are suited to both feedlot finishing and natural grazing systems." },
  "CROSSBREED:WBRAWH": { title: "What is a Wangus Brahman Weaner Heifer?", description: "A Wangus Brahman weaner heifer is a young recently-weaned female from Angus and Brahman cross. These weaners offer the growth potential and beef quality of Angus combined with the hardiness of Brahman at an early stage, allowing the buyer to rear them to their preferred system." },

  // Communal grades
  "COMMUNAL:C1": { title: "What are Communal Heifers?", description: "Communal heifers are young female cattle from communal farming areas. These animals are typically indigenous or crossbred and may vary in breed type, size and condition. Communal heifers offer an affordable entry into cattle ownership and can be improved with better nutrition and management." },
  "COMMUNAL:C2": { title: "What are Communal Steers?", description: "Communal steers are castrated male cattle from communal farming areas. These animals are raised under traditional management systems and vary in breed, size and finish. Communal steers are typically lighter than commercial stock but can respond well to improved feeding." },

  // Generic category grades (BREEDING, HEIFER, STEER)
  "BREEDING:B1": { title: "What are B1 Breeding Cows?", description: "B1 breeding cows are the top-graded female cattle in simplified auction breeding classifications. These cows have proven fertility, good body condition and sound conformation, making them the most valuable breeding females at sale." },
  "BREEDING:B3": { title: "What are B3 Cow and Calf Units?", description: "B3 cow and calf units are breeding cows sold with a calf at foot under simplified auction grading. The buyer gets an immediately productive breeding animal plus a young calf, making this one of the most popular lots at rural livestock auctions." },
  "BREEDING:B4": { title: "What are B4 Breeding Bulls?", description: "B4 breeding bulls are male cattle sold for breeding under simplified auction grading. These bulls may be purebred or crossbred and are evaluated on size, condition, structural soundness and fertility." },
  "HEIFER:H1": { title: "What are H1 Weaner Heifers?", description: "H1 weaner heifers are the top-graded young female weaners at auction. These are well-grown calves recently separated from their mothers, offering the highest potential for growth as future breeding stock or fattening for slaughter." },
  "HEIFER:H2": { title: "What are H2 Lightweight Heifers?", description: "H2 lightweight heifers are young females in the middle weight range. They need additional growing time before reaching breeding or slaughter weight and are typically purchased by farmers with access to good grazing." },
  "HEIFER:H3": { title: "What are H3 Bulling Heifers?", description: "H3 bulling heifers are young females of breeding age sold under simplified grading. These heifers are ready to be mated and represent an opportunity to add breeding females to a herd at auction prices." },
  "STEER:S1": { title: "What are S1 Weaner Steers?", description: "S1 weaner steers are the top-graded young castrated males at auction. These are well-grown weaners with excellent frame and condition, commanding the highest prices in the weaner steer category." },
  "STEER:S2": { title: "What are S2 Lightweight Steers?", description: "S2 lightweight steers are young castrated males in the middle weight range. They require further growing on pasture or feedlot before reaching slaughter weight and offer good value for patient buyers." },
  "STEER:S3": { title: "What are S3 Feeder Steers?", description: "S3 feeder steers are castrated males ready for finishing on feedlot or improved pasture. They are heavier than weaners and closer to slaughter weight, reducing the time and feed investment needed before sale." },

  // BREED category (mixed breed sale lots)
  "BREED:ANGCC": { title: "What is an Angoni Cow in Calf?", description: "An Angoni cow in calf is a pregnant indigenous Angoni cow confirmed to be carrying. Angoni cows are hardy, disease-resistant animals that calve easily and raise strong calves on natural grazing with minimal intervention." },
  "BREED:ANGCHC": { title: "What is an Angoni Cow and Heifer in Calf?", description: "An Angoni cow and heifer in calf is a lot containing a pregnant Angoni cow sold together with a pregnant heifer. This gives the buyer two breeding females and two unborn calves in a single purchase." },
  "BREED:ANGHC": { title: "What is an Angoni Heifer in Calf?", description: "An Angoni heifer in calf is a young Angoni female pregnant with her first calf. This combines a young breeding animal with proven fertility and an upcoming calf." },
  "BREED:BM C H IC": { title: "What is a Beefmaster Cow and Heifer in Calf?", description: "A Beefmaster cow and heifer in calf is a lot containing a pregnant Beefmaster cow sold with a pregnant heifer. This provides the buyer with two Beefmaster breeding females and two calves on the way." },
  "BREED:BM C IC": { title: "What is a Beefmaster Cow in Calf?", description: "A Beefmaster cow in calf is a pregnant Beefmaster female confirmed to be carrying. Beefmaster cows are valued for their balanced traits including milking ability, fertility and docile temperament." },
  "BREED:BM CC": { title: "What is a Beefmaster Cow and Calf?", description: "A Beefmaster cow and calf is a proven Beefmaster cow sold with her suckling calf at foot. This gives the buyer an immediately productive breeding unit with the Beefmaster breed's balanced selection traits." },
  "BREED:BM H IC": { title: "What is a Beefmaster Heifer in Calf?", description: "A Beefmaster heifer in calf is a young pregnant Beefmaster female. This combines a young breeding animal with many productive years ahead and the certainty of an upcoming calf." },
  "BREED:BOCIC": { title: "What is a Boran Cow in Calf (Breed Sale)?", description: "A Boran cow in calf at a breed sale is a purebred pregnant Boran cow offered as registered breeding stock. Breed sale animals carry verified pedigrees and typically command higher prices than commercial auction lots." },
  "BREED:BON C H DRY": { title: "What is a Bonsmara Cow and Heifer Dry?", description: "A Bonsmara cow and heifer dry is a lot containing a Bonsmara cow and heifer that are not currently pregnant. Dry females are priced lower than pregnant animals but offer value for buyers who can manage their own breeding programme." },
  "BREED:BON C H IC": { title: "What is a Bonsmara Cow and Heifer in Calf?", description: "A Bonsmara cow and heifer in calf is a lot with a pregnant Bonsmara cow and a pregnant heifer. This provides the buyer with two high-quality composite breed females and two calves on the way." },
  "BREED:BON C IC": { title: "What is a Bonsmara Cow in Calf?", description: "A Bonsmara cow in calf is a pregnant Bonsmara female. Bonsmara cows combine Afrikaner hardiness with Hereford and Shorthorn growth, making them productive breeding cows in Zimbabwe's commercial herds." },
  "BREED:BRCC": { title: "What is a Brahman Cow in Calf?", description: "A Brahman cow in calf is a pregnant Brahman female confirmed to be carrying. Brahman cows are renowned for their mothering ability, longevity and tropical adaptation, making pregnant Brahman cows a premium breeding purchase." },
  "BREED:SAN C H IC": { title: "What is a Sanga Cow and Calf?", description: "A Sanga cow and calf is a Sanga-type female sold with her calf. Sanga cattle are indigenous African breeds characterised by their distinctive cervico-thoracic hump and long horns. They are hardy, heat-tolerant and well-adapted to extensive grazing systems." },
  "BREED:SAN C IC": { title: "What is a Sanga Cow in Calf?", description: "A Sanga cow in calf is a pregnant Sanga-type female. Sanga breeds include various indigenous cattle types known for their disease resistance and ability to thrive on natural veld in challenging environments." },
  "BREED:SAN H IC": { title: "What is a Sanga Heifer in Calf?", description: "A Sanga heifer in calf is a young pregnant Sanga-type female. These heifers offer indigenous genetics with proven fertility, ideal for farmers seeking hardy, low-maintenance breeding stock." },

  // Other species
  "SHEEP:": { title: "What are Sheep at Livestock Auction?", description: "Sheep sold at Zimbabwean livestock auctions include various breeds and crosses raised for mutton production. Sheep are graded on condition, fat cover and weight. The main sheep-producing regions are in the cooler highveld areas of Zimbabwe." },
  "GOAT:": { title: "What are Goats at Livestock Auction?", description: "Goats at livestock auction include both indigenous and improved breeds raised for meat (chevon). Goat meat is popular in Zimbabwe, particularly for traditional and ceremonial occasions. Goats are hardy browsers that perform well in drier regions where cattle may struggle." },
  "PORK:": { title: "What is Pork at Livestock Auction?", description: "Pork at livestock auction refers to pigs sold for slaughter. Pig grading in Zimbabwe follows the P1, P2 and manufacturing classification based on backfat thickness and carcass weight. Pork is a growing segment of Zimbabwe's meat market." },
  "CHICKEN:": { title: "What are Chickens at Livestock Auction?", description: "Chickens at livestock auction are typically sold in bulk lots by weight grade. Categories include broilers over 1.75 kg, 1.55 to 1.75 kg, under 1.55 kg, and off-layers (spent hens). Chicken is the most affordable meat protein in Zimbabwe." },
}

type GradeEntry = {
  key: string
  produce: string
  grade: string
  code: string
  price_type: string
  template_type: string
  avg: number
  high: number
  low: number
  trend: number[]
  buyer_count: number
}

type BuyerEntry = {
  client_id: string
  client_name: string
  last_active: string
  grade_delivered_usd: number
  grade_collected_usd: number
  avg_amount_head: number
  max_amount_head: number
  min_amount_head: number
  has_booking: boolean
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All"
const TIME_RANGES: TimeRange[] = ["1M", "3M", "6M", "1Y", "All"]

function KgStats({ totalBuyers, gradeCount, avg, high, low }: {
  totalBuyers: number
  gradeCount: number
  avg: number
  high: number
  low: number
}) {
  return (
    <>
      <div className="mb-3 pb-3 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Buyers</p>
        <p className="text-sm font-semibold text-foreground">{totalBuyers}</p>
      </div>
      <div className="mb-3 pb-3 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Grade Prices</p>
        <p className="text-sm font-semibold text-foreground">{gradeCount}</p>
      </div>
      {avg > 0 && (
        <>
          <div className="mb-3 pb-3 border-b flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Avg Price</p>
            <p className="text-sm font-semibold text-foreground">${(avg / 100).toFixed(2)}/kg</p>
          </div>
          <div className="mb-3 pb-3 border-b flex items-center justify-between">
            <p className="text-sm text-muted-foreground">All-time High</p>
            <p className="text-sm font-semibold text-green-600">${(high / 100).toFixed(2)}/kg</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">All-time Low</p>
            <p className="text-sm font-semibold text-red-500">${(low / 100).toFixed(2)}/kg</p>
          </div>
        </>
      )}
    </>
  )
}

// Point-based slicing — calculates how many entries to show based on the
// actual density of the data (total points / total days spanned).
function filterByRange(history: { value: number; date: string }[], range: TimeRange) {
  if (range === "All" || history.length < 2) return history
  const days = range === "1M" ? 30 : range === "3M" ? 90 : range === "6M" ? 180 : 365
  const spanDays = (new Date(history[history.length - 1].date).getTime() - new Date(history[0].date).getTime()) / 86400000
  const pointsPerDay = history.length / spanDays
  const points = Math.max(1, Math.round(pointsPerDay * days))
  return history.slice(-points)
}

// ── Market Insights ───────────────────────────────────────────────────────────

interface MarketNewsItem {
  id: string
  guid: string
  title: string
  link: string
  description: string
  published_at: string
  source: string
  source_url: string
}

function addUTM(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.set("utm_source", "farmnport")
    u.searchParams.set("utm_medium", "prices_board")
    u.searchParams.set("utm_campaign", "market_news")
    return u.toString()
  } catch {
    return url
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function NewsSheet({ item, open, onClose }: { item: MarketNewsItem | null; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <SheetClose asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          </SheetClose>
        </div>
        {item && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-5 border-b">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">TLDR</p>
              <p className="text-base font-bold text-foreground leading-snug mb-3">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
            <div className="px-5 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Sources</p>
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground">{item.source[0]}</span>
                    <span className="text-sm font-semibold text-foreground">{item.source}</span>
                  </div>
                  <a href={addUTM(item.link)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                <p className="text-[11px] text-muted-foreground/60">{timeAgo(item.published_at)}</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

const NEWS_PAGE_SIZE = 20

function InsightsTimeline() {
  const [selected, setSelected] = useState<MarketNewsItem | null>(null)
  const [page, setPage] = useState(1)
  const [allItems, setAllItems] = useState<MarketNewsItem[]>([])
  const [total, setTotal] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useQuery({
    queryKey: ["market-news", page],
    queryFn: () => queryMarketNews(page, NEWS_PAGE_SIZE),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const incoming: MarketNewsItem[] = data?.data?.data ?? []
    const t: number = data?.data?.total ?? 0
    if (incoming.length === 0) return
    setTotal(t)
    setAllItems(prev => {
      const existingGuids = new Set(prev.map(i => i.guid))
      const fresh = incoming.filter(i => !existingGuids.has(i.guid))
      return [...prev, ...fresh]
    })
  }, [data])

  const hasMore = allItems.length < total

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isFetching && hasMore) setPage(p => p + 1) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFetching, hasMore])

  return (
    <>
      <NewsSheet item={selected} open={!!selected} onClose={() => setSelected(null)} />
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Latest News</p>
        {allItems.map((item, i) => (
          <div key={item.guid} className="relative pb-6 last:pb-0">
            {i < allItems.length - 1 && (
              <span className="absolute left-[4px] top-[18px] bottom-0 w-px bg-border" />
            )}
            <div className="flex gap-3">
              <div className="mt-[9px] shrink-0 w-2 flex justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 block" />
              </div>
              <button onClick={() => setSelected(item)} className="min-w-0 flex-1 text-left">
                <p className="text-[11px] text-muted-foreground mb-1">{timeAgo(item.published_at)}</p>
                <p className="text-xs font-semibold text-foreground leading-snug mb-2">{item.title}</p>
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold leading-none text-muted-foreground">{item.source[0]}</span>
                  1 source
                </div>
              </button>
            </div>
          </div>
        ))}
        <div ref={sentinelRef} className="h-4" />
        {isFetching && (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-[9px] shrink-0 w-2 flex justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/60 block" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted/60 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
        {allItems.length === 0 && !isFetching && (
          <p className="text-xs text-muted-foreground">No news available</p>
        )}
      </div>
    </>
  )
}

export function ProduceGradeBoard({
  produce,
  code: initialCode,
  priceType: initialPriceType,
}: {
  produce: string
  code: string
  priceType: string
}) {
  const [codeParam, setCodeParam] = useQueryState("code", { defaultValue: initialCode.toLowerCase(), shallow: true })
  const [typeParam, setTypeParam] = useQueryState("type", { defaultValue: initialPriceType.toLowerCase(), shallow: true })
  const [timeRange, setTimeRange] = useState<TimeRange>("All")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [chartKey, setChartKey] = useState(0)
  const [buyersPage, setBuyersPage] = useState(1)

  const overviewRef = useRef<HTMLDivElement>(null)
  const buyersRef = useRef<HTMLDivElement>(null)

  const { data: seriesSummaryData } = useQuery({
    queryKey: ["series-summary"],
    queryFn: querySeriesSummary,
    refetchOnWindowFocus: false,
  })

  const gradeEntries: GradeEntry[] = (seriesSummaryData?.data?.data ?? [])
    .map((e: any): GradeEntry => ({
      key: `${e.template_type}_${e.category}_${e.code}_${e.name}`,
      produce: e.category.charAt(0) + e.category.slice(1).toLowerCase(),
      grade: e.name,
      code: e.code,
      price_type: e.template_type === "cdm" ? "Cold Dress Mass" : "Liveweight",
      template_type: e.template_type,
      avg: e.avg,
      high: e.high,
      low: e.low,
      trend: e.trend,
      buyer_count: e.buyer_count ?? 0,
    }))
    .filter((e: GradeEntry) => e.produce.toLowerCase() === produce.toLowerCase())
    .sort((a: GradeEntry, b: GradeEntry) => b.avg - a.avg)

  const produceName = produce.charAt(0).toUpperCase() + produce.slice(1)
  const priceTypes = Array.from(new Set(gradeEntries.map(e => e.price_type)))

  const activeCategory = produce.toUpperCase()
  const activeTemplateType = typeParam === "cdm" ? "cdm" : "lwt"

  const { data: buyersData, status: buyersStatus } = useQuery({
    queryKey: ["series-buyers", activeCategory, codeParam, activeTemplateType],
    queryFn: () => querySeriesBuyers(activeCategory, codeParam, activeTemplateType),
    enabled: !!codeParam,
    refetchOnWindowFocus: false,
  })

  const buyerRelations: BuyerEntry[] = buyersData?.data?.data ?? []
  const buyersTotal: number = buyersData?.data?.total ?? 0

  useEffect(() => {
    if (gradeEntries.length === 0) return
    setSelectedKey(null)
    let match: GradeEntry | undefined
    if (codeParam && typeParam) {
      const typeLabel = typeParam === "cdm" ? "Cold Dress Mass" : "Liveweight"
      match = gradeEntries.find(e => e.code.toLowerCase() === codeParam.toLowerCase() && e.price_type === typeLabel)
    } else if (codeParam) {
      match = gradeEntries.find(e => e.code.toLowerCase() === codeParam.toLowerCase())
    }
    setSelectedKey((match ?? gradeEntries[0]).key)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produce, gradeEntries.length])

  const best = (selectedKey ? gradeEntries.find(e => e.key === selectedKey) : null) ?? gradeEntries[0]
  const activeType = best?.price_type ?? priceTypes[0] ?? ""
  const activeKey = best?.key ?? ""
  const peerGrades = gradeEntries.filter(e => e.price_type === activeType)


  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ["series-chart", activeCategory, codeParam, activeTemplateType],
    queryFn: () => querySeriesChart(activeCategory, codeParam, activeTemplateType),
    enabled: !!codeParam,
    refetchOnWindowFocus: false,
  })

  const rawHistory: { value: number; date: string }[] = chartData?.data?.history ?? []
  const filtered = filterByRange(rawHistory, timeRange)
  const chartValues = filtered.map(p => p.value)
  const chartDates = filtered.map(p => p.date)

  const bestChange = (() => {
    const t = best?.trend ?? []
    if (t.length < 2) return null
    const prev = t[t.length - 2], curr = t[t.length - 1]
    if (!prev) return null
    return ((curr - prev) / prev) * 100
  })()

  const buyersPageCount = Math.ceil(buyersTotal / 10)

  function handleTypeSwitch(type: string) {
    const first = gradeEntries.find(e => e.price_type === type)
    if (first) { setSelectedKey(first.key); setChartKey(k => k + 1) }
  }
  function handleGradeSelect(k: string) {
    setSelectedKey(k)
    setChartKey(n => n + 1)
    const entry = gradeEntries.find(e => e.key === k)
    if (entry) {
      setCodeParam(entry.code.toLowerCase())
      setTypeParam(entry.price_type === "Cold Dress Mass" ? "cdm" : "lwt")
    }
    setBuyersPage(1)
  }
  function handleTimeRange(r: TimeRange) { setTimeRange(r); setChartKey(k => k + 1) }

  return (
    <main className="min-h-screen scroll-smooth">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 min-w-0">

          {/* ── overview ── */}
          <div id="section-overview" ref={overviewRef} className="flex flex-col md:flex-row border-b">

            {/* info panel */}
            <div className="md:w-80 lg:w-96 xl:w-[420px] md:shrink-0 md:border-r border-b md:border-b-0 pt-6 px-4 md:pt-8 md:px-6 pb-6 md:pb-10">
              <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
                <Link href="/prices" className="hover:text-foreground">Prices</Link>
                <span>/</span>
                <span className="text-foreground font-semibold">{produceName} Price</span>
              </p>
              <h2 className="text-sm mb-4 font-bold text-foreground">{produceName}</h2>
              {best && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-4xl md:text-5xl font-bold text-foreground">${toDollars(best.avg)}</p>
                    <span className="text-sm text-muted-foreground">{best.grade}</span>
                    {bestChange !== null && (
                      <span className={`text-xs font-medium ${bestChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {bestChange >= 0 ? "▲" : "▼"} {bestChange >= 0 ? "+" : ""}{bestChange.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              )}
              {best && (
                <div className="hidden md:block">
                  <KgStats totalBuyers={buyersTotal} gradeCount={peerGrades.length} avg={best.avg} high={best.high} low={best.low} />
                </div>
              )}
            </div>

            {/* chart area */}
            <div className="flex-1 min-w-0 pt-4 md:pt-6 px-4 flex flex-col pb-6">
              {priceTypes.length > 0 && (
                <div className="flex items-center gap-0 border-b mb-4 -mx-4 px-4">
                  {priceTypes.map(type => (
                    <button key={type} onClick={() => handleTypeSwitch(type)}
                      className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeType === type ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 mb-4">
                <Select value={activeKey} onValueChange={handleGradeSelect}>
                  <SelectTrigger className="h-8 text-xs w-48 focus:ring-0 focus:ring-offset-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {peerGrades.map(e => <SelectItem key={e.key} value={e.key} className="text-xs">{e.grade}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
                  {TIME_RANGES.map(r => (
                    <button key={r} onClick={() => handleTimeRange(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${timeRange === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 300 }}>
                {isChartLoading ? (
                  <div className="w-full h-full rounded-lg bg-muted/30 animate-pulse" />
                ) : chartValues.length > 0 ? (
                  <PriceChart
                    values={chartValues.length === 1 ? [chartValues[0], chartValues[0]] : chartValues}
                    dates={chartDates.length === 1 ? [chartDates[0], chartDates[0]] : chartDates}
                    animKey={chartKey}
                  />
                ) : null}
              </div>
              {best && (
                <div className="md:hidden mt-6 pt-4 border-t">
                  <KgStats totalBuyers={buyersTotal} gradeCount={peerGrades.length} avg={best.avg} high={best.high} low={best.low} />
                </div>
              )}
            </div>

          </div>{/* end overview */}

          {/* ── grade description SEO content ── */}
          {(() => {
            const key = `${activeCategory}:${best?.code ?? ""}`
            const catKey = `${activeCategory}:`
            const desc = gradeDescriptions[key] ?? gradeDescriptions[catKey]
            if (!desc) return null
            return (
              <div className="px-4 md:px-8 py-8 border-t border-border/50">
                <h2 className="text-lg font-semibold text-foreground mb-3">{desc.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc.description}</p>
              </div>
            )
          })()}

          {/* ── buy / sell CTA ── */}
          {best && (
            <div className="px-4 md:px-8 py-8 border-t border-border/50">
              <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-nowrap items-center gap-3 overflow-x-auto">
                <Link href="/lots/new/buy" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0">
                  I Want Stock →
                </Link>
                <Link href="/bookings/new/buy" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap shrink-0">
                  Book Regular Supply →
                </Link>
                <span className="w-px h-6 bg-border shrink-0" />
                <Link href="/lots/new/sell" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0">
                  I Am Selling →
                </Link>
                <Link href="/bookings/new/sell" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap shrink-0">
                  Supply Regularly →
                </Link>
                <span className="w-px h-6 bg-border shrink-0" />
                <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {isSlaughterGrade(best.code, activeCategory)
                    ? `Buy or sell ${best.grade.toLowerCase()} grade ${produceName.toLowerCase()} online through farmnport.`
                    : `Buy or sell ${best.grade.toLowerCase()} ${produceName.toLowerCase()} online through farmnport.`}
                </p>
              </div>
            </div>
          )}

          {/* ── buyers section ── */}
          <div id="section-buyers" ref={buyersRef} className="px-4 md:px-8 py-8">
            <p className="text-lg font-semibold text-foreground mb-4">{produceName} Buyers</p>
            {buyersStatus === "pending" ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                    <div className="w-6 h-4 bg-muted rounded animate-pulse shrink-0" />
                    <div className="w-7 h-6 bg-muted rounded animate-pulse shrink-0" />
                    <div className="h-4 bg-muted rounded animate-pulse flex-1 max-w-[140px]" />
                    <div className="h-4 bg-muted rounded animate-pulse w-14 ml-auto" />
                    <div className="h-4 bg-muted rounded animate-pulse w-14" />
                    <div className="h-4 bg-muted rounded animate-pulse w-14" />
                  </div>
                ))}
              </div>
            ) : buyerRelations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No buyers listed for this produce yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium w-8 tabular-nums">#</th>
                      <th className="text-left py-2 font-medium">Buyer</th>
                      <th className="text-left py-2 pl-2 font-medium">Per kg</th>
                      <th className="text-left py-2 pl-2 font-medium">Change</th>
                      <th className="text-left py-2 pl-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerRelations.map((b, i) => {
                      const currentPrice = b.grade_delivered_usd > 0 ? b.grade_delivered_usd : b.grade_collected_usd
                      const trend = best?.trend ?? []
                      const pct = trend.length >= 2 && trend[trend.length - 2]
                        ? ((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 100
                        : null
                      return (
                        <tr key={b.client_id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 pr-4 text-muted-foreground tabular-nums text-xs">{(buyersPage - 1) * 10 + i + 1}</td>
                          <td className="py-3 font-medium text-foreground capitalize">
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-flex items-center justify-center border border-border text-xs font-mono text-muted-foreground w-7 h-6 rounded shrink-0">
                                {makeAbbveriation(b.client_name).toUpperCase().slice(0, 2)}
                              </span>
                              <Link href={`/buyer/${slug(b.client_name)}`} className="hover:underline">{b.client_name}</Link>
                            </span>
                          </td>
                          <td className="py-3 pl-2 tabular-nums text-sm font-semibold">
                            {currentPrice > 0
                              ? <>${toDollars(currentPrice)}<span className="text-xs font-normal text-muted-foreground">/kg</span></>
                              : <span className="text-muted-foreground font-normal text-xs">—</span>}
                          </td>
                          <td className="py-3 pl-2 tabular-nums text-xs font-medium">
                            {pct !== null
                              ? <span className={pct >= 0 ? "text-green-600" : "text-red-500"}>{pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%</span>
                              : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="py-3 pl-2">
                            <Link href="/lots/new/sell" className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">Sell to Buyer →</Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {buyersPageCount > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6">
                {Array.from({ length: buyersPageCount }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setBuyersPage(n)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${buyersPage === n ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>{/* end buyers */}

        </div>{/* end left column */}

        {/* right sidebar */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 border-l">
          <div className="sticky top-6 pt-6 overflow-y-auto max-h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-5 mb-5">
              <p className="text-sm"><span className="font-bold text-foreground">Market</span>{" "}<span className="font-normal text-muted-foreground">Insights</span></p>
            </div>
            <div className="px-5 pb-8">
              <InsightsTimeline />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
