Quick Guide — Gallery Tags (Non-technical)

What this program does

- Lets you look at photos one by one and add or remove category tags (e.g. portrait, nature).
- Saves your changes to a local gallery file while you're working.

Where to put image files

1. Open the `public/photos/` folder in the project.
2. Put your images in three subfolders (recommended):
   - `thumb` — small images used in the thumbnail preview
   - `medium` — medium size (optional)
   - `full` — full-size images shown in the main viewer
3. Make sure the filenames match. Example: for `myphoto.webp` place files as:
   - `public/photos/thumb/myphoto.webp`
   - `public/photos/medium/myphoto.webp` (optional)
   - `public/photos/full/myphoto.webp`

Gallery JSON file

- The app uses `src/Data/gallery.json` to know which images exist and what their tags are.
- After adding images to `public/photos/`, add a matching entry in `src/Data/gallery.json` with the same filenames (you can copy an existing entry and change paths/ids).
- While the dev server is running, your tag edits will be saved back into `src/Data/gallery.json`.

Controls (simple)

- Buttons:
  - Previous / Next — move between photos. When you move on, changes are saved.
  - Tag buttons (right side) — click to add/remove a tag for the current photo. The "all" tag stays.
- Keyboard shortcuts:
  - 1 → portrait
  - 2 → nature
  - 3 → landscape
  - 4 → urban
  - 5 → documentary
  - Space → Next
  - B → Previous
- Thumbnails: click a thumbnail in the preview area to open that photo in the editor and scroll to top.
