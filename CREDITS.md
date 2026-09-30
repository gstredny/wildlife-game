# Credits

## Photos

Every card shows a real photo from Wikimedia Commons. Each is free to share under the license named
here; the Creative Commons ones ask for credit, which the card and this list give. `tools/fetch-photos.py`
downloads and crops them.

- Cicada (superb cicada, *Neotibicen superbus*): xpda, CC BY-SA 4.0. [Source](https://commons.wikimedia.org/wiki/File:Neotibicen_superbus_P1500620a.jpg)
- Roseate spoonbill: Giles Laurent, CC BY-SA 4.0. [Source](https://commons.wikimedia.org/wiki/File:042_Roseate_spoonbill_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg)
- White ibis: Rhododendrites, CC BY-SA 4.0. [Source](https://commons.wikimedia.org/wiki/File:White_ibis_(10239).jpg)
- Great blue heron: Frank Schulenburg, CC BY-SA 3.0. [Source](https://commons.wikimedia.org/wiki/File:Great_Blue_Heron_(Ardea_herodias),_hunting.jpg)
- American alligator: Bernard Gagnon, CC BY-SA 3.0. [Source](https://commons.wikimedia.org/wiki/File:Alligator_at_ChampionGates.jpg)
- Coyote: Frank Schulenburg, CC BY-SA 4.0. [Source](https://commons.wikimedia.org/wiki/File:Urban_Coyote,_Bernal_Heights.jpg)
- Wild hog (feral hogs with piglets): Steve Hillebrand (U.S. Fish and Wildlife Service), public domain. [Source](https://commons.wikimedia.org/wiki/File:Wild_hogs_family.jpg)
- White-tailed deer: Paul Danese, CC BY-SA 4.0. [Source](https://commons.wikimedia.org/wiki/File:20241125_white_tailed_deer_cedar_hill_cemetery_PD205041.jpg)

## Voice

Ranger Mike's voice is Qwen3-TTS 1.7B CustomVoice (Apache-2.0), speaker `ryan`, recorded ahead of time
with `tools/make-voice.py`. A small Parakeet speech-to-text model checks each clip while recording.

## Drawings, sounds and code

The trail, the explorer and the animal drawings are drawn by the game's own code. The sounds are
made by the game with the Web Audio API.

## Expanded habitat animals

These Commons photographs load when online until `tools/fetch-habitat-photos.py` downloads
local copies. Offline fallbacks are original game illustrations, explicitly labeled on the card.
The license links below apply to photographs; illustrations are original Wildlife Game art.

- **bullfrog**: [Photo: Carl D. Howe, CC BY-SA 2.5](https://commons.wikimedia.org/wiki/File:North-American-bullfrog1.jpg) ([license](https://creativecommons.org/licenses/by-sa/2.5/)).
- **nightHeron**: [Photo: Michael L. Baird, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Black-crowned_Night-heron.jpg) ([license](https://creativecommons.org/licenses/by/2.0/)).
- **woodDuck**: [Photo: Mehmet Karatay, CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Wood_duck.jpg) ([license](https://creativecommons.org/licenses/by-sa/3.0/)).
- **leopardFrog**: [Photo: William L. Farr, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Southern_leopard_frog_%28Lithobates_sphenocephalus%29%2C_Liberty_Co._TX_%28April_2009%29.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **slider**: [Photo: Rhondle, CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Red-eared_slider.jpg) ([license](https://creativecommons.org/licenses/by-sa/3.0/)).
- **cottonmouth**: [Photo: TimVickers, public domain](https://commons.wikimedia.org/wiki/File:Agkistrodon_piscivorus_%281%29.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **watersnake**: [Photo: William L. Farr, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Plain-bellied_Watersnake_%28Nerodia_erythrogaster%29%2C_Chambers_Co.%2C_TX%2C_26_July_2013.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **dragonfly**: [Photo: Mike Ostrowski, CC BY-SA 2.0](https://commons.wikimedia.org/wiki/File:Common_Green_Darner.jpg) ([license](https://creativecommons.org/licenses/by-sa/2.0/)).
- **riverOtter**: [Photo: Ken Thomas, public domain](https://commons.wikimedia.org/wiki/File:River_Otter-27527.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **raccoon**: [Photo: Mathias Appel, CC0 1.0](https://commons.wikimedia.org/wiki/File:Raccoon_%2816869245759%29.jpg) ([license](https://creativecommons.org/publicdomain/zero/1.0/)).
- **cardinal**: [Photo: Ken Thomas, public domain](https://commons.wikimedia.org/wiki/File:Northern_Cardinal_Male-27527-2.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **bobcat**: [Photo: Calibas, public domain](https://commons.wikimedia.org/wiki/File:Bobcat2.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **pelican**: [Photo: LunarEcho87, CC0 1.0](https://commons.wikimedia.org/wiki/File:Brown_Pelican_at_Seawolf_Park.jpg) ([license](https://creativecommons.org/publicdomain/zero/1.0/)).
- **egret**: [Photo: Mildeep, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:The_great_egret_%28Ardea_alba%29.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **kingfisher**: [Photo: Courtney Celley (USFWS), public domain](https://commons.wikimedia.org/wiki/File:Belted_kingfisher_%2853267654093%29.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **redwing**: [Photo: Stevielist, public domain](https://commons.wikimedia.org/wiki/File:Redwingblackbird2.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **nutria**: [Photo: Christine Eustis (USFWS), public domain](https://commons.wikimedia.org/wiki/File:Close_up_of_nutria_or_coypu_myocastor_coypus.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **opossum**: [Photo: PookieFugglestein, CC0 1.0](https://commons.wikimedia.org/wiki/File:Virginia_opossum_during_daytime.jpg) ([license](https://creativecommons.org/publicdomain/zero/1.0/)).
- **armadillo**: [Photo: Mwcolgan8, public domain](https://commons.wikimedia.org/wiki/File:Armadillo2.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **squirrel**: [Photo: Keithbob, public domain](https://commons.wikimedia.org/wiki/File:Fox_squirrel.JPG) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **barredOwl**: [Photo: Hardyplants, public domain](https://commons.wikimedia.org/wiki/File:Barred-owl-full-size.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **woodpecker**: [Photo: Ken Thomas, public domain](https://commons.wikimedia.org/wiki/File:Red-bellied_Woodpecker.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **boxTurtle**: [Photo: Carnopod, public domain](https://commons.wikimedia.org/wiki/File:Three-toed_Box_Turtle.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **blueJay**: [Photo: Hardyplants, public domain](https://commons.wikimedia.org/wiki/File:Bluejay.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **mockingbird**: [Photo: Keenanhye, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Northern_Mockingbird_closeup.jpg) ([license](https://creativecommons.org/licenses/by/4.0/)).
- **dove**: [Photo: Ken Thomas, public domain](https://commons.wikimedia.org/wiki/File:Mourning_Dove-27527.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **grackle**: [Photo: Andy Morffew, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Great-tailed_Grackle_%2813968094544%29.jpg) ([license](https://creativecommons.org/licenses/by/2.0/)).
- **hummingbird**: [Photo: Joe Schneid, CC BY 3.0](https://commons.wikimedia.org/wiki/File:RubyThroatedHummingbird.jpg) ([license](https://creativecommons.org/licenses/by/3.0/)).
- **anole**: [Photo: Jnikiel, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Native_Florida_Green_Anole.jpg) ([license](https://creativecommons.org/licenses/by/4.0/)).
- **monarch**: [Photo: liz west, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Monarch_butterfly_-_%285%29.jpg) ([license](https://creativecommons.org/licenses/by/2.0/)).
- **toad**: [Photo: Kevin Young, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Incilius_nebulifer-lateral_view.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **rabbit**: [Photo: William R. James (USFWS), public domain](https://commons.wikimedia.org/wiki/File:Eastern_cotton_tail_in_grass.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **hawk**: [Photo: Daniel Ankele, public domain](https://commons.wikimedia.org/wiki/File:Red-Tailed_Hawk.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **kestrel**: [Photo: Channel City Camera Club, CC BY 2.0](https://commons.wikimedia.org/wiki/File:American_Kestrel_%2853468230687%29.jpg) ([license](https://creativecommons.org/licenses/by/2.0/)).
- **meadowlark**: [Photo: Andy Morffew, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Eastern_Meadowlark_%288634451300%29.jpg) ([license](https://creativecommons.org/licenses/by/2.0/)).
- **killdeer**: [Photo: ADJ82, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Killdeer-27JAN2017.jpg) ([license](https://creativecommons.org/licenses/by/4.0/)).
- **scissortail**: [Photo: Mike's Birds, CC BY-SA 2.0](https://commons.wikimedia.org/wiki/File:Scissor-tailed_flycatcher_%2816946223616%29.jpg) ([license](https://creativecommons.org/licenses/by-sa/2.0/)).
- **gull**: [Photo: VJAnderson, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Laughing_Gull_adult_summer%2C_Daytona_Beach%2C_Florida.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **tern**: [Photo: Peter Wallack, CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:LEAST_TERN.jpg) ([license](https://creativecommons.org/licenses/by-sa/3.0/)).
- **avocet**: [Photo: Rhododendrites, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:American_avocet_%2884260%29.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **plover**: [Photo: Jacob Gross (USFWS), public domain](https://commons.wikimedia.org/wiki/File:Piping_Plover_%2812776646935%29.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **crab**: [Photo: Zammerman, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Ocypode_quadrata.png) ([license](https://creativecommons.org/licenses/by/4.0/)).
- **seaTurtle**: [Photo: Keenan Adams (USFWS), public domain](https://commons.wikimedia.org/wiki/File:Kemps_Ridley_Turtle_%28Lepidochelys_kempii%29_%286307264526%29.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **attwaterChicken**: [Photo: George Lavendowski, U.S. Fish and Wildlife Service, public domain](https://commons.wikimedia.org/wiki/File:Attwater%27s_Prairie_Chicken.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **whiteTailedHawk**: [Photo: Michael Hurben, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:White-tailed_Hawks,_Hidalgo_County,_Texas.jpg) ([license](https://creativecommons.org/licenses/by-sa/4.0/)).
- **caracara**: [Photo: Don Faulkner, CC BY-SA 2.0](https://commons.wikimedia.org/wiki/File:Crested_Caracara_(26020679542).jpg) ([license](https://creativecommons.org/licenses/by-sa/2.0/)).
- **snowGoose**: [Photo: lwolfartist, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Snow_goose_bombay_hook_12.31.19_DSC_0322.jpg) ([license](https://creativecommons.org/licenses/by/2.0/)).
- **whistlingDuck**: [Photo: Larry D. Moore, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Black_Bellied_Whistling_Ducks_Brazos_Bend_SP_Texas_2023.jpg) ([license](https://creativecommons.org/licenses/by/4.0/)).
- **crawfish**: [Photo: Mike Murphy, public domain](https://commons.wikimedia.org/wiki/File:Procambarus_clarkii.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **freeTailedBat**: [Photo: Ann Froschauer, U.S. Fish and Wildlife Service, public domain](https://commons.wikimedia.org/wiki/File:Tadarida_brasiliensis_2.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **houstonToad**: [Photo: Robert Thomas, U.S. Fish and Wildlife Service, public domain](https://commons.wikimedia.org/wiki/File:Houston_toad_(1).jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
- **sandhillCrane**: [Photo: Frankyboy5, public domain](https://commons.wikimedia.org/wiki/File:Lesser_Sandhill.jpg) ([license](https://creativecommons.org/publicdomain/mark/1.0/)).
