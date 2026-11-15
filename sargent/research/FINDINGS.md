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
