# ASTRIA

ASTRIA is a health check-in for a person on a long mission. There is no account and no login. Open it, enter how you slept, moved, and felt, and it tells you what changed and one thing to do next.

This is not a medical device. It does not diagnose.

## Run it

Open `public/index.html` in a browser, or from this folder:

```bash
python3 -m http.server 5179 -d public
```

Then visit `http://localhost:5179`.

Firebase Hosting is configured (`firebase.json` serves the `public` folder). Deploy later with the Firebase project you choose:

```bash
firebase use --add
firebase deploy --only hosting
```

Check-ins stay in the browser (`localStorage`). Nothing is sent to a server. Check-ins are the person’s own notes, or an invented sample week. They are not astronaut medical records.

## NASA data and resources

These are the NASA resources the app actually reads. Use the name as the submission “Link Text.”

| Link text | URL |
| --- | --- |
| NASA DONKI Solar Energetic Particle events | https://ccmc.gsfc.nasa.gov/tools/DONKI/ |
| NASA Open Science Data Repository OSD-575 | https://osdr.nasa.gov/bio/repo/data/studies/OSD-575 |
| NASA Open Science Data Repository OSD-656 | https://osdr.nasa.gov/bio/repo/data/studies/OSD-656 |
| NASA Human Research Program | https://www.nasa.gov/hrp/ |

DONKI solar-particle events from 1–20 May 2024 are saved in `public/data/nasa.json` (retrieved 15 Nov 2026 from `https://api.nasa.gov/DONKI/SEP`). A query for 16 Sep–15 Nov 2026 returned no events. OSD-575 and OSD-656 are the Inspiration4 serum and urine studies. The four health cards follow Human Research Program risks: immune, bone and muscle, cardiovascular, and behavioral health.

## Super Intelligence disclosure

Super Intelligence tools were used to build this project.

- **Grok, in Cursor** (a large language model): application code (`public/index.html`, `public/styles.css`, `public/app.js`), Firebase hosting configuration, interface writing, and this README.
- **Cursor image generation**: the six illustrations in `public/images/`.

Each illustration file is stamped with a visible **AI-generated** watermark, and the same words appear in the page captions. The pictures do not use, contain, or modify space-agency logos, flags, or mission identifiers. The small mark in the header is a hand-written SVG, not a generated image.

No audio or video was generated.
