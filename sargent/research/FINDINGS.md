# Carnation, Lily, Lily, Rose: what the level rests on

Checked 15 November 2026. Texts are saved in this folder. Status: verified (stated by the Tate, or by the picture itself), partly verified (Wikipedia only, or sources disagree), unverified (treated as invention).

## Sources read
- `tate_catalogue_entry_wayback_20161108.txt`: Tate catalogue entry for N01615 (Chamot, Farr and Butlin, 1964), Wayback copy of 8 Nov 2016
- `tate_summary_wayback_20161108.txt`: Tate summary by Terry Riggs, February 1998, same snapshot date
- `tate_mrs_barnard_wayback_20190604.txt`: Tate page for N05901 with display caption and catalogue entry, Wayback copy of 4 June 2019
- `tate_carnation.txt`, `tate_mrs_barnard.txt`: the live Tate pages, 15 Nov 2026 (title, artist, date, "on display at Tate Britain"; caption and catalogue text are not in the served page)
- `wp_Carnation,_Lily,_Lily,_Rose.json`, `wp_Fred_Barnard.json`: English Wikipedia
- `commons_file.json`, `commons_mrs_barnard_file.json`: Wikimedia Commons API records

## Images
- `images/carnation.jpg`: https://commons.wikimedia.org/wiki/File:John_Singer_Sargent_-_Carnation,_Lily,_Lily,_Rose_-_Google_Art_Project.jpg (public domain)
- `images/mrs_barnard.jpg`: https://commons.wikimedia.org/wiki/File:John_Singer_Sargent_(1856-1925)_-_Mrs_Frederick_Barnard_-_N05901_-_National_Gallery.jpg (public domain; the file name says National Gallery, the picture is Tate N05901)
- Sargent died in 1925.

## Claims
| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Title, artist, 1885–6, oil on canvas, 174 × 153.7 cm, Tate N01615 | verified | Tate catalogue entry |
| 2 | On display at Tate Britain | verified | live Tate page, 15 Nov 2026 |
| 3 | Two children in white lighting Chinese lanterns among flowers at twilight | verified | Tate catalogue entry |
| 4 | Painted out of doors at Broadway: Farnham House, September to early November 1885; Russell House, summer 1886; finished October 1886 | verified | Tate catalogue entry, summary |
| 5 | Models Polly and Dorothy (Dolly) Barnard, daughters of the illustrator Frederick Barnard; they replaced Katharine Millet, five | verified | Tate |
| 6 | Dolly, eleven, on the left; Polly, seven, on the right | partly verified | Tate says so twice; Wikipedia's "Fred Barnard" gives Polly born 1874 and Dolly 1878, which reverses the ages. Birth years not checked against a primary record. The level follows the Tate for who stands where and avoids "elder" and "younger" |
| 7 | Chosen for the colour of their hair | verified | Tate. Wikipedia says blonde; in the picture the left girl's hair is brown, the right girl's lighter. The figures follow the picture |
| 8 | Only a few minutes' work each evening in the mauve light; easel and models set ready beforehand | verified | Tate summary |
| 9 | Artificial flowers replaced the dying ones | verified | Tate |
| 10 | Gosse: he stood back, "ran forward over the lawn with the action of a wag-tail", and retired | verified | Tate summary, quoting Charteris 1927, pp. 74–5 |
| 11 | Title from the song "The Wreath" by Joseph Mazzinghi | verified | Tate |
| 12 | Roses, carnations, tall white lilies | verified by the picture | picture |
| 13 | The seven lanterns in the picture and their places | verified | read off the picture |
| 14 | *Mrs Frederick Barnard*, 1885, Tate N05901: the girls' mother, painted at Broadway "at the time when Sargent was working on" the first | verified | Tate N05901 caption and catalogue entry |

## The second painting
`paintings` is 2. *Mrs Frederick Barnard* is staged as an earlier waypoint at the garden door. Real: the portrait, its date and place, that she is their mother. Invented: the staging; the portrait has a plain dark red ground and no source puts her at a garden door.

## Unverified, marked as imagined on the end card
- The garden's plan, house, wall and trees; the number and places of the lanterns.
- The breeze, the fireflies, the race against the dark.
- Every word spoken by the painter and the sisters.
- The painter's dress, hair and beard.
- That the girls lit lanterns all over a garden: the Tate says only that he posed them.

## Faults found in common/link.js while building (worked round in street.html)
1. Firebase drops empty arrays, so `send({ lit: [] })` arrives without `lit`.
2. After `close`, a guest never gets `open` again.
3. A guest watches only the first host's name, so a reloaded host is never heard (worked round by polling `host`).
4. A host record is trusted for 15 s against the newcomer's clock and is not deleted on page close (the level deletes it on `pagehide`); a guest's `open` fires after 400 ms whether or not a host is there.

## What the level teaches (added 17 November 2026)

The one thing: Sargent could paint this picture for only a few minutes each evening, in one exact light, so everything had to be set ready beforehand.

Source re-read 17 November 2026 (saved here already): `tate_summary_wayback_20161108.txt`, the Tate summary by Terry Riggs for N01615, http://www.tate.org.uk/art/artworks/sargent-carnation-lily-lily-rose-n01615/text-summary (the address the saved page gives for itself; it is the Wayback Machine's copy of 8 Nov 2016, whose own address was not recorded when it was saved); and `tate_catalogue_entry_wayback_20161108.txt`.

| Statement | Status | Quotation |
|---|---|---|
| Only a few minutes each evening, in the right light | verified | Tate summary: "Sargent was able to work for only a few minutes each evening when the light was exactly right." Catalogue entry: "work could only proceed for a few minutes each evening when the right kind of mauvish light was present" |
| Everything set ready beforehand, the models posed in advance | verified | Tate summary: "He would place his easel and paints beforehand, and pose his models in anticipation of the few moments when he could paint the mauvish light of dusk." |
| Two or three minutes, the light failing | verified | Tate summary, quoting Edmund Gosse: "All this occupied but two or three minutes, the light rapidly declining" |
| Slow progress over two seasons | verified | Catalogue entry: "Progress was necessarily slow" |

What the players do. Lighting the lanterns is now the getting ready, not the end. The picture is painted only while three things hold together: the dusk clock is in its mauve band (from 50 to 72 per cent of the way to dark: 40 seconds at the default three minutes), every lantern is lit, and both girls stand still in their own places among the lilies (a bright ring marks each). Eight seconds of that finish it, and the painter's canvas fills only then. If all is ready early, the afternoon runs on six times faster to the light. If the band passes before the picture is done, "the light has gone for today": the clock goes back to late afternoon, the lanterns stay lit, the canvas keeps what it has, and another evening follows. The old ending when the dark came (the painter calling them in to a finished picture) is gone: there is no picture without the minutes. A line at the foot of the screen says which of the three things is wanting, and the painter calls every six seconds in the mauve.

Two players: nothing new is sent over the link. Each device works the painting out from what it already shares (the lanterns, the host's dusk clock, where the two girls are); only the host ends the level, with the existing `end` event. The other girl is drawn up to 1.4 m from her true place, so her ring is counted generously (2.6 m). The workarounds for common/link.js were not touched.

Simplified: eight seconds for two autumns; one band of light on a clock; evenings that follow one another at once.

The game's own: the rings; the numbers; every word the painter says ("Everything ready before the light comes! Quick, the lanterns!", "All ready. Now we wait for the light.", "Now! The light is right. To your places, and keep still!", "The light is right and we are not ready! The lanterns, quick!", "To your place among the lilies! It will not last.", "Where is your sister? To her place, quick!", "Gone! Tomorrow evening, then. Have everything ready."). That the children lit the lanterns as the preparation is the picture's subject, not a record of the sittings.
