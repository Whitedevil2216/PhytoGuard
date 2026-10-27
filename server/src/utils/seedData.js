export const INITIAL_DISEASES = [
  {
    cropName: 'Apple',
    diseaseName: 'Apple Scab',
    scientificName: 'Venturia inaequalis',
    classLabel: 'Apple___Apple_scab',
    isHealthy: false,
    description:
      'Apple scab is a common fungal disease of apple trees favored by cool, wet spring weather. Primary infections originate from overwintering spores on fallen orchard leaves and spread via rain splash to young foliage and developing fruit.',
    symptoms: [
      'Olive-green to velvety dark brown lesions with feathery margins on leaf surfaces',
      'Twisted, puckered, or prematurely yellowing and dropping leaves under heavy infection',
      'Dark, corky, scabby spots on developing fruit skin that may crack as fruit expands',
    ],
    prevention: [
      'Select scab-resistant apple cultivars suited to local climatic conditions',
      'Rake, shred, or compost fallen autumn leaves to reduce overwintering fungal inoculum',
      'Prune orchard canopies annually to promote air circulation and faster leaf drying',
    ],
    management: [
      'Monitor local degree-day and leaf-wetness forecasts during spring green-tip to petal-fall stages',
      'Avoid overhead irrigation that extends leaf wetness periods',
      'Consult local university agricultural extension guides for regionally approved protective schedules if disease pressure is severe',
    ],
    referenceUrls: [
      {
        title: 'Penn State Extension — Apple Disease: Scab',
        url: 'https://extension.psu.edu/apple-disease-apple-scab',
      },
      {
        title: 'University of Minnesota Extension — Apple Scab',
        url: 'https://extension.umn.edu/plant-diseases/apple-scab',
      },
    ],
  },
  {
    cropName: 'Apple',
    diseaseName: 'Black Rot',
    scientificName: 'Botryosphaeria obtusa',
    classLabel: 'Apple___Black_rot',
    isHealthy: false,
    description:
      'Black rot (also called frogeye leaf spot on foliage) is a fungal pathogen affecting apple leaves, limbs, and fruit. The fungus survives winter in dead bark, fire-blight cankers, and mummified fruit left on the tree.',
    symptoms: [
      'Circular purple flecks on leaves that enlarge into tan centers with purple margins ("frogeye" spots)',
      'Reddish-brown sunken limb cankers with rough, peeling bark',
      'Firm brown rot on maturing fruit developing concentric dark rings and shriveling into black mummies',
    ],
    prevention: [
      'Prune out dead wood, winter-injured limbs, and visible limb cankers during dormant winter pruning',
      'Remove all mummified fruit from trees and the orchard floor before spring budbreak',
      'Maintain balanced tree nutrition and prevent bark wounds caused by machinery or sunscald',
    ],
    management: [
      'Sanitize pruning shears between cuts when removing cankered branches',
      'Remove nearby wild or abandoned pome trees that harbor fungal inoculum',
      'Contact a certified orchard extension specialist for integrated management programs',
    ],
    referenceUrls: [
      {
        title: 'UMN Extension — Black Rot of Apple',
        url: 'https://extension.umn.edu/plant-diseases/black-rot-apple',
      },
    ],
  },
  {
    cropName: 'Apple',
    diseaseName: 'Healthy',
    scientificName: 'Malus domestica (Healthy Foliage)',
    classLabel: 'Apple___healthy',
    isHealthy: true,
    description:
      'The inspected apple leaf displays uniform green chlorophyll coloration, intact serrated margins, and normal venation with no visible fungal lesions, necrotic spotting, or pest stippling.',
    symptoms: [
      'Uniform deep green upper leaf blade with fine pubescence underneath',
      'Intact leaf margins without curling, puckering, or necrotic halos',
      'Absence of velvety fungal growth or insect feeding damage',
    ],
    prevention: [
      'Continue annual dormant pruning for sunlight penetration and airflow',
      'Conduct routine soil testing before applying orchard fertilizers',
      'Scout foliage weekly after spring rain events to catch early issues',
    ],
    management: [
      'Maintain clean orchard floor sanitation in autumn',
      'Irrigate at the root zone during prolonged drought periods',
      'No corrective disease treatment is needed while foliage remains healthy',
    ],
    referenceUrls: [
      {
        title: 'Penn State Extension — Home Orchard Guide',
        url: 'https://extension.psu.edu/home-orchard-guide',
      },
    ],
  },
  {
    cropName: 'Corn (Maize)',
    diseaseName: 'Common Rust',
    scientificName: 'Puccinia sorghi',
    classLabel: 'Corn_(maize)___Common_rust_',
    isHealthy: false,
    description:
      'Common rust of maize is caused by the wind-borne fungus Puccinia sorghi. Cool to moderate temperatures (16–23 °C) combined with high relative humidity and heavy dew favor rapid spore germination on corn leaves.',
    symptoms: [
      'Brick-red to cinnamon-brown oval elongated pustules appearing on both upper and lower leaf surfaces',
      'Ruptured leaf epidermis around pustules releasing powdery rust-colored urediniospores',
      'Pustules darkening to black teliospores as the corn plant approaches maturity',
    ],
    prevention: [
      'Plant commercial field corn or sweet corn hybrids rated for high partial resistance to common rust',
      'Plant on schedule so crops pass vulnerable early vegetative stages before peak spore arrival',
      'Scout late-planted corn and sweet corn fields closely during cool, humid periods',
    ],
    management: [
      'Assess pustule coverage on ear leaves and upper canopy prior to tasseling before considering intervention',
      'Field corn with moderate resistance rarely requires chemical intervention; consult state extension thresholds for susceptible sweet corn',
    ],
    referenceUrls: [
      {
        title: 'Crop Protection Network — Common Rust of Corn',
        url: 'https://cropprotectionnetwork.org/encyclopedia/common-rust-of-corn',
      },
    ],
  },
  {
    cropName: 'Corn (Maize)',
    diseaseName: 'Northern Leaf Blight',
    scientificName: 'Exserohilum turcicum',
    classLabel: 'Corn_(maize)___Northern_Leaf_Blight',
    isHealthy: false,
    description:
      'Northern corn leaf blight (NCLB) is a significant foliar fungal disease that overwinters in infected corn crop residue. Moderate temperatures and extended leaf wetness (6+ hours) promote lesion expansion across upper leaves.',
    symptoms: [
      'Long, elliptical, grayish-green to tan cigar-shaped lesions (2.5 to 15 cm long) parallel to leaf veins',
      'Dusty dark olive-gray fungal sporulation inside lesions under humid conditions',
      'Blighting progressing from lower leaves upward toward the ear leaf, reducing grain fill when severe',
    ],
    prevention: [
      'Choose corn hybrids carrying polygenic resistance and appropriate Ht resistance genes',
      'Rotate away from continuous corn for at least one growing season to allow surface residue breakdown',
      'Manage volunteer corn plants that bridge pathogen survival between seasons',
    ],
    management: [
      'Scout fields from late vegetative stage (V12) through silking (R1), focusing on the ear leaf and leaves above',
      'Consult regional extension agronomy thresholds when susceptible hybrids show expanding lesions prior to tasseling',
    ],
    referenceUrls: [
      {
        title: 'Crop Protection Network — Northern Corn Leaf Blight',
        url: 'https://cropprotectionnetwork.org/encyclopedia/northern-corn-leaf-blight-of-corn',
      },
    ],
  },
  {
    cropName: 'Corn (Maize)',
    diseaseName: 'Healthy',
    scientificName: 'Zea mays (Healthy Foliage)',
    classLabel: 'Corn_(maize)___healthy',
    isHealthy: true,
    description:
      'The maize leaf shows healthy parallel venation, vibrant green photosynthetic tissue, and clean margins with no rust pustules, cigar-shaped lesions, or nutrient deficiency streaking.',
    symptoms: [
      'Consistent green coloration along the entire leaf blade and midrib',
      'Smooth, unbroken epidermis on both upper and lower leaf surfaces',
      'No necrotic spots, chlorotic streaks, or fungal fruiting bodies',
    ],
    prevention: [
      'Maintain crop rotation with legumes or small grains to preserve soil health',
      'Ensure adequate nitrogen and potassium availability based on soil analysis',
      'Keep field borders clear of grassy weeds that host insect vectors',
    ],
    management: [
      'Continue periodic scouting through tasseling and grain fill',
      'No disease control intervention is warranted for healthy foliage',
    ],
    referenceUrls: [
      {
        title: 'Crop Protection Network — Corn Management',
        url: 'https://cropprotectionnetwork.org/crops/corn',
      },
    ],
  },
  {
    cropName: 'Grape',
    diseaseName: 'Black Rot',
    scientificName: 'Guignardia bidwellii',
    classLabel: 'Grape___Black_rot',
    isHealthy: false,
    description:
      'Grape black rot is one of the most destructive fungal diseases of grapevines in warm, humid climates. The pathogen overwinters in mummified berries on the trellis or soil and infects young leaves, shoots, and berries during warm rains.',
    symptoms: [
      'Small circular reddish-brown spots on upper leaf surfaces bordered by a narrow dark brown margin',
      'Tiny black dot-like fungal fruiting bodies (pycnidia) arranged in a ring inside leaf lesions',
      'Infected green berries turning light brown, then shriveling into hard, wrinkled blue-black mummies',
    ],
    prevention: [
      'Remove and destroy all mummified clusters from vines and wires during winter pruning',
      'Position shoots and selectively remove leaves around fruit zones to maximize sunlight and airflow',
      'Control vineyard floor weeds to prevent stagnant humidity beneath the trellis',
    ],
    management: [
      'Monitor critical cluster susceptibility from immediate pre-bloom through 4–5 weeks post-bloom',
      'Consult viticulture extension specialists for integrated vineyard protection schedules tailored to local weather',
    ],
    referenceUrls: [
      {
        title: 'Penn State Extension — Grape Black Rot',
        url: 'https://extension.psu.edu/black-rot-on-grapes-in-home-gardens',
      },
    ],
  },
  {
    cropName: 'Grape',
    diseaseName: 'Healthy',
    scientificName: 'Vitis vinifera (Healthy Foliage)',
    classLabel: 'Grape___healthy',
    isHealthy: true,
    description:
      'The grape leaf exhibits normal lobed morphology, crisp green coloration, and healthy veins without downy mildew oil spots, powdery coating, or black-rot lesions.',
    symptoms: [
      'Clean palmately lobed leaf blade with even green pigment',
      'Underside free from white cottony or powdery fungal growth',
      'Intact petiole and veins with normal turgor',
    ],
    prevention: [
      'Maintain open trellis training and timely summer shoot positioning',
      'Use drip irrigation rather than overhead sprinklers in vineyards',
      'Inspect undersides of basal leaves regularly after warm rainfalls',
    ],
    management: [
      'Continue standard canopy management and balanced vine nutrition',
      'No disease management action required',
    ],
    referenceUrls: [
      {
        title: 'Cornell CALS — Grapes Integrated Pest Management',
        url: 'https://nysipm.cornell.edu/agriculture/grapes/',
      },
    ],
  },
  {
    cropName: 'Pepper (Bell)',
    diseaseName: 'Bacterial Spot',
    scientificName: 'Xanthomonas euvesicatoria',
    classLabel: 'Pepper,_bell___Bacterial_spot',
    isHealthy: false,
    description:
      'Bacterial spot of bell pepper is caused by seed- and splash-borne Xanthomonas species. Warm temperatures (24–30 °C), driving rain, and overhead irrigation rapidly spread bacteria across foliage and fruit.',
    symptoms: [
      'Small water-soaked spots on lower leaves turning dark brown with slightly raised undersides',
      'Generalized yellowing (chlorosis) around lesions followed by severe premature leaf drop and fruit sunscald',
      'Raised, warty, scab-like brown spots on developing bell pepper fruit',
    ],
    prevention: [
      'Use certified pathogen-free seed and inspected disease-free transplants',
      'Select bell pepper cultivars carrying stacked bacterial spot resistance genes (e.g., X10/Bs2)',
      'Practice a 2-to-3-year rotation away from peppers, tomatoes, and solanaceous weeds',
    ],
    management: [
      'Avoid walking, cultivating, or harvesting fields while pepper foliage is wet with dew or rain',
      'Switch from overhead sprinklers to drip irrigation with plastic or organic mulch to stop soil splash',
      'Remove heavily infected crop debris promptly after final harvest and consult extension specialists for local guidance',
    ],
    referenceUrls: [
      {
        title: 'NC State Extension — Bacterial Spot of Pepper and Tomato',
        url: 'https://content.ces.ncsu.edu/bacterial-spot-of-pepper-and-tomato',
      },
    ],
  },
  {
    cropName: 'Pepper (Bell)',
    diseaseName: 'Healthy',
    scientificName: 'Capsicum annuum (Healthy Foliage)',
    classLabel: 'Pepper,_bell___healthy',
    isHealthy: true,
    description:
      'The bell pepper leaf appears glossy, smooth, and uniformly green without water-soaked bacterial lesions, viral mottling, or leaf curling.',
    symptoms: [
      'Glossy, lance-ovate green leaf blade with smooth margins',
      'No sunken necrotic spots, chlorotic halos, or defoliation',
      'Normal shoot tip expansion without mosaic distortion',
    ],
    prevention: [
      'Use drip irrigation and mulch beds to keep soil off lower leaves',
      'Stake pepper plants to prevent branches from touching damp soil',
      'Scout weekly for aphids, thrips, and early foliar spotting',
    ],
    management: [
      'Maintain consistent soil moisture to prevent blossom-end rot on fruit',
      'No disease intervention needed',
    ],
    referenceUrls: [
      {
        title: 'UC IPM — Peppers Pest Management Guidelines',
        url: 'https://ipm.ucanr.edu/agriculture/peppers/',
      },
    ],
  },
  {
    cropName: 'Potato',
    diseaseName: 'Early Blight',
    scientificName: 'Alternaria solani',
    classLabel: 'Potato___Early_blight',
    isHealthy: false,
    description:
      'Early blight of potato is caused by the fungus Alternaria solani, which overwinters in soil, infected tuber debris, and volunteer potatoes. Older, senescing lower leaves and nutrient-stressed plants are most susceptible.',
    symptoms: [
      'Dark brown to black circular or angular spots containing distinct concentric target-like rings',
      'Lesions frequently bounded by larger leaf veins and surrounded by yellow chlorotic tissue',
      'Shallow, dark, sunken dry lesions with raised purple-brown borders on stored tubers',
    ],
    prevention: [
      'Plant certified disease-free seed tubers and choose cultivars with later maturity or partial tolerance',
      'Rotate fields out of potato and tomato crops for at least 2–3 years',
      'Maintain adequate soil nitrogen and phosphorus fertility to prevent premature vine stress',
    ],
    management: [
      'Time irrigation so foliage dries thoroughly before nightfall',
      'Allow tuber skins to mature fully before harvest and minimize mechanical bruising that invites tuber infection',
      'Consult regional potato extension advisories for scouting thresholds',
    ],
    referenceUrls: [
      {
        title: 'University of Idaho / PNW Handbooks — Potato Early Blight',
        url: 'https://pnwhandbooks.org/plantdisease/host-disease/potato-solanum-tuberosum-early-blight',
      },
    ],
  },
  {
    cropName: 'Potato',
    diseaseName: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    classLabel: 'Potato___Late_blight',
    isHealthy: false,
    description:
      'Potato late blight is a rapidly spreading oomycete (water mold) disease capable of defoliating entire fields within days during cool, wet, or foggy weather. It survives between seasons only in living potato tubers or host tissue.',
    symptoms: [
      'Pale green to dark brown water-soaked blotches near leaf tips and margins without strict vein boundaries',
      'Delicate white downy sporulation ring at lesion edges on leaf undersides during cool, humid mornings',
      'Dark brown lesions on stems and reddish-brown granular dry rot extending shallowly beneath tuber skin',
    ],
    prevention: [
      'Plant strictly certified seed potatoes and destroy all cull piles and volunteer potato plants before emergence',
      'Hill soil adequately over developing tubers to shield them from spores washed down from foliage',
      'Avoid nighttime irrigation and dense, poorly ventilated plantings',
    ],
    management: [
      'Treat suspected late blight as an urgent community disease: confirm diagnosis immediately with a local agricultural extension diagnostic lab',
      'Ensure vines are completely dead for 2–3 weeks before harvesting tubers so foliar sporangia do not infect tubers at harvest',
    ],
    referenceUrls: [
      {
        title: 'USAblight / Cornell — Managing Potato and Tomato Late Blight',
        url: 'https://usablight.org/',
      },
    ],
  },
  {
    cropName: 'Potato',
    diseaseName: 'Healthy',
    scientificName: 'Solanum tuberosum (Healthy Foliage)',
    classLabel: 'Potato___healthy',
    isHealthy: true,
    description:
      'The compound potato leaf displays healthy green leaflets, firm turgor, and clean undersides free from target lesions or water-soaked blight blotches.',
    symptoms: [
      'Even green compound leaflets with clean veins and petioles',
      'No concentric target spots or white underside mold',
      'Vigorous canopy architecture',
    ],
    prevention: [
      'Continue scouting lower and inner canopy leaves weekly, especially after cool rain events',
      'Maintain proper hilling and well-drained soil conditions',
    ],
    management: [
      'Follow balanced irrigation and nutrition schedules',
      'No disease action needed while plants remain healthy',
    ],
    referenceUrls: [
      {
        title: 'UC IPM — Potato Pest Management Guidelines',
        url: 'https://ipm.ucanr.edu/agriculture/potato/',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Bacterial Spot',
    scientificName: 'Xanthomonas perforans / X. vesicatoria',
    classLabel: 'Tomato___Bacterial_spot',
    isHealthy: false,
    description:
      'Tomato bacterial spot thrives in warm, rainy environments and spreads rapidly through splashing water, wind-driven rain, contaminated seeds, and worker handling of wet plants.',
    symptoms: [
      'Small (< 3 mm), dark brown to black greasy-appearing lesions on leaves and stems',
      'Shot-hole appearance when necrotic centers dry out and tear away, accompanied by leaflet yellowing',
      'Slightly raised, scabby brown spots with pale halos on green tomato fruit',
    ],
    prevention: [
      'Source certified pathogen-tested seed and raise transplants away from mature production fields',
      'Rotate out of solanaceous crops (tomato, pepper, eggplant, potato) for at least 2–3 years',
      'Sanitize stakes, cages, and greenhouse benches thoroughly between crops',
    ],
    management: [
      'Use drip irrigation over plastic or straw mulch and never prune or tie plants while leaves are wet',
      'Work in unaffected plant blocks before entering affected areas to limit mechanical spread',
      'Consult local extension pathology guides for integrated management strategies',
    ],
    referenceUrls: [
      {
        title: 'Cornell Vegetable MD — Bacterial Diseases of Tomato',
        url: 'https://www.vegetables.cornell.edu/pest-management/disease-factsheets/',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Early Blight',
    scientificName: 'Alternaria linariae (syn. Alternaria solani)',
    classLabel: 'Tomato___Early_blight',
    isHealthy: false,
    description:
      'Early blight is one of the most prevalent fungal diseases of tomato worldwide. Infections typically start on older lower leaves exposed to soil splash and progress upward during warm weather alternating with rain or heavy dew.',
    symptoms: [
      'Brown circular lesions up to 1.2 cm wide featuring characteristic concentric "bulls-eye" target rings',
      'Pronounced yellow chlorotic tissue surrounding spots, leading to browning and loss of lower leaves',
      'Dark sunken leathery lesions with concentric rings at the stem end of fruit and collar rot on seedling stems',
    ],
    prevention: [
      'Stake, trellis, or cage tomato plants and prune lower leaves up to 15–20 cm above mulched soil',
      'Apply organic straw or plastic mulch to block rain splash of soil-borne fungal spores',
      'Practice a 3-year crop rotation away from tomatoes, potatoes, and eggplants',
    ],
    management: [
      'Irrigate strictly at the base using drip lines early in the morning',
      'Remove and dispose of severely blighted lower leaves (with dry hands/tools) to improve canopy airflow',
      'Consult local extension vegetable specialists if disease progresses steadily into the middle canopy',
    ],
    referenceUrls: [
      {
        title: 'UMN Extension — Early Blight in Tomato and Potato',
        url: 'https://extension.umn.edu/disease-management/early-blight-tomato-and-potato',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    classLabel: 'Tomato___Late_blight',
    isHealthy: false,
    description:
      'Tomato late blight is a destructive oomycete disease favored by cool-to-moderate temperatures and high humidity or rainfall. Wind-blown sporangia can travel long distances and rapidly destroy foliage, stems, and fruit.',
    symptoms: [
      'Large, irregular, pale olive-green to brown water-soaked blotches on leaves that quickly turn papery dark brown',
      'Fuzzy white ring of sporangia on leaf undersides around lesion borders during humid mornings',
      'Dark brown elongated stem lesions and firm, greasy, coppery-brown rough blotches on green or ripe fruit',
    ],
    prevention: [
      'Select modern tomato varieties bred with stacked late-blight resistance genes (e.g., Ph-2 + Ph-3)',
      'Space and stake plants generously for rapid foliage drying and inspect transplants carefully before planting',
      'Eliminate volunteer potatoes and nightshade weeds near tomato plots',
    ],
    management: [
      'Confirm suspected late blight promptly with a county agricultural extension office to protect neighboring farms',
      'Bag and remove severely infected plants in place (avoid carrying uncovered sporulating plants across healthy rows)',
    ],
    referenceUrls: [
      {
        title: 'Cornell CALS — Tomato Late Blight Fact Sheet',
        url: 'https://usablight.org/identify/',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Leaf Mold',
    scientificName: 'Passalora fulva (syn. Fulvia fulva)',
    classLabel: 'Tomato___Leaf_Mold',
    isHealthy: false,
    description:
      'Tomato leaf mold is a fungal foliar disease most common in greenhouses, high tunnels, and humid coastal production where relative humidity exceeds 85% for extended periods.',
    symptoms: [
      'Pale greenish-yellow spots without sharp margins on the upper leaf surface',
      'Distinct olive-green to velvety grayish-purple fungal growth directly underneath spots on the lower leaf surface',
      'Infected leaves curling upward, withering, and hanging dry from stems starting on older foliage',
    ],
    prevention: [
      'Choose greenhouse and high-tunnel tomato cultivars carrying Cf resistance genes',
      'Ventilate high tunnels and greenhouses aggressively and circulate air to keep relative humidity below 85%',
      'Steam-clean or sanitize tunnel frames, twine, and stakes thoroughly between cropping cycles',
    ],
    management: [
      'Prune lower leaves to improve horizontal air movement and avoid late-afternoon watering',
      'Remove crop residues promptly at season end; consult protected-culture extension guides if resistant races appear',
    ],
    referenceUrls: [
      {
        title: 'UMN Extension — Tomato Leaf Mold',
        url: 'https://extension.umn.edu/disease-management/tomato-leaf-mold',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Septoria Leaf Spot',
    scientificName: 'Septoria lycopersici',
    classLabel: 'Tomato___Septoria_leaf_spot',
    isHealthy: false,
    description:
      'Septoria leaf spot is a very common splash-dispersed fungal disease affecting tomato foliage after fruit set begins. Unlike early blight, lesions are smaller, more numerous, and rarely infect tomato fruit directly.',
    symptoms: [
      'Numerous small circular spots (2–4 mm) with dark brown borders and pale tan or gray centers',
      'Tiny black pepper-grain fruiting bodies (pycnidia) visible with a hand lens in the gray center of spots',
      'Rapid yellowing, browning, and defoliation of lower leaves, exposing fruit to sunscald',
    ],
    prevention: [
      'Mulch soil beneath staked tomato plants to stop rain from splashing spores onto lower leaves',
      'Rotate out of tomatoes and control horse nettle and nightshade weeds for 2–3 years',
      'Space rows adequately and water only at soil level via drip irrigation',
    ],
    management: [
      'Remove infected basal leaves early when foliage is completely dry and sanitize tools afterward',
      'Plow under or remove all infected vines and stakes at the end of harvest; consult extension guides if defoliation threatens upper canopy',
    ],
    referenceUrls: [
      {
        title: 'Missouri Botanical Garden — Septoria Leaf Spot of Tomato',
        url: 'https://www.missouribotanicalgarden.org/gardens-gardening/your-garden/help-for-the-home-gardener/advice-tips-resources/pests-and-problems/diseases/fungal-spots/septoria-leaf-spot-of-tomato',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Two-Spotted Spider Mite',
    scientificName: 'Tetranychus urticae',
    classLabel: 'Tomato___Spider_mites Two-spotted_spider_mite',
    isHealthy: false,
    description:
      'Two-spotted spider mites are tiny arachnid pests (under 0.5 mm) that pierce leaf cells and extract sap. Outbreaks surge rapidly during hot, dry, dusty conditions or when broad-spectrum insecticides eliminate natural predatory mites.',
    symptoms: [
      'Fine pale yellow or whitish stippling (flecking) across upper leaf surfaces',
      'Bronzed, dry, papery leaves as feeding damage coalesces',
      'Fine silky webbing on leaf undersides and shoot tips containing tiny moving mites and spherical eggs',
    ],
    prevention: [
      'Keep field roadways damp or vegetated to reduce dust settling on tomato leaves',
      'Maintain consistent irrigation so plants are not drought-stressed during hot weather',
      'Conserve beneficial natural enemies (predatory mites, minute pirate bugs, lacewings) by avoiding unnecessary broad-spectrum sprays',
    ],
    management: [
      'Inspect leaf undersides with a 10x hand lens to confirm live mite presence before acting',
      'Remove isolated heavily webbed hotspot leaves carefully into sealed bags',
      'Consult extension IPM guidelines regarding biological control releases or selective miticides',
    ],
    referenceUrls: [
      {
        title: 'UC IPM — Spider Mites on Tomato',
        url: 'https://ipm.ucanr.edu/agriculture/tomato/spider-mites/',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Tomato Yellow Leaf Curl Virus',
    scientificName: 'Begomovirus (TYLCV, transmitted by Bemisia tabaci)',
    classLabel: 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    isHealthy: false,
    description:
      'Tomato Yellow Leaf Curl Virus (TYLCV) is a persistent whitefly-transmitted viral disease that severely stunts tomato plants and causes flower drop when infection occurs early in crop development.',
    symptoms: [
      'New upper leaves become markedly smaller, cupped upward, crinkled, and stiff',
      'Pronounced bright yellow margins between green veins on young leaves',
      'Shortened internodes creating a bushy, stunted upright habit with severe blossom drop and reduced fruit set',
    ],
    prevention: [
      'Plant TYLCV-resistant tomato hybrids (carrying Ty-1, Ty-2, or Ty-3 resistance genes) in regions where silverleaf whiteflies occur',
      'Raise seedlings inside fine insect-exclusion mesh nurseries and inspect transplants for whitefly nymphs',
      'Enforce a host-free period between tomato seasons and remove solanaceous/malvaceous weed reservoirs',
    ],
    management: [
      'Once a plant is systemically infected with a virus it cannot be cured; rogue (bag and remove) early-infected stunted plants promptly so whiteflies do not acquire virus from them',
      'Use yellow sticky cards to monitor whitefly movement and consult extension entomologists for integrated vector management',
    ],
    referenceUrls: [
      {
        title: 'UC IPM — Tomato Yellow Leaf Curl',
        url: 'https://ipm.ucanr.edu/agriculture/tomato/tomato-yellow-leaf-curl/',
      },
    ],
  },
  {
    cropName: 'Tomato',
    diseaseName: 'Healthy',
    scientificName: 'Solanum lycopersicum (Healthy Foliage)',
    classLabel: 'Tomato___healthy',
    isHealthy: true,
    description:
      'The tomato leaflet exhibits vibrant mid-to-deep green coloration, flat uncurled lamina, and clean surfaces without fungal concentric rings, bacterial shot-holes, mite stippling, or viral upward cupping.',
    symptoms: [
      'Uniform green compound leaves with normal serrated margins and trichomes',
      'Undersides free from mold, webbing, or whitefly colonies',
      'Balanced internode spacing and healthy flower cluster development',
    ],
    prevention: [
      'Maintain mulch cover, staking, and soil-level drip irrigation',
      'Prune suckers when dry to preserve canopy airflow',
      'Scout lower leaves and shoot tips weekly throughout the growing season',
    ],
    management: [
      'Continue regular watering and balanced calcium/potassium nutrition',
      'No corrective plant-protection measures are needed',
    ],
    referenceUrls: [
      {
        title: 'Cornell CALS — Vegetable Growing Guides: Tomatoes',
        url: 'https://gardening.cals.cornell.edu/garden-guidance/food-garden/vegetable-growing-guides/',
      },
    ],
  },
];
