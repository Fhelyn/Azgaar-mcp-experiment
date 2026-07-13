## Azgaar Fantasy Map + MCP Experiment

This is an experimental fork of [Azgaar's Fantasy Map Generator](https://github.com/Azgaar/Fantasy-Map-Generator) integrated with a local Claude MCP Server.

**Stack:** C++ (compiled to WASM), Node.js (MCP Server), HTML / JS / SVG

### Added Features
- **Lidar Tool:** Custom button added in `index.html` to enable terrain scanning.
- **Region Search:** Auto-search on zoom with a red circle marker.
- **Launcher:** `Mainkan_Azgaar.bat` for one-click local run, no more manual typing.

### How to Run
1. Build WASM if you modified C++ source in `map/`
2. `cd mcp-Azgaar && npm install`
3. Run `npm run dev` or double-click `Mainkan_Azgaar.bat`
4. Connect Claude Desktop to local MCP server via config pointing to `mcp-Azgaar/`

### Known Issues / Help Wanted
We need help with coordinate synchronization. See full breakdown in [#1](../../issues/1)

> **Active Bug:** [Coordinate desync between Lidar, Search Marker, and WASM Layer](../../issues/1) - help wanted!

**1. Lidar Coordinate Mismatch**
The custom Lidar button I added in `index.html` reports a different cursor position than Azgaar's internal coordinate system. Claude reads one set of coordinates, but the actual cursor position on screen is different. There is a desync between `cursor coords`, `Azgaar internal coords`, and `Claude-detected coords`.

**2. Region Search Marker Drift on Zoom**
The region search feature is not accurate when zoomed. The auto-search triggers correctly and shows a red circle marker, but the marker fails to follow SVG transform changes during zoom/pan.

**3. Stale Map Data / Name Desync on Imported Maps**
When loading an old .map file, the rendered label and the underlying data become out of sync. For example, the map visually shows `Ajan`, but Claude / the MCP tool queries the data as `Caan`. Searching for `Caan` works and finds the feature, but upon selection the UI displays `Ajan`, while searching for `Ajan` returns no result. This suggests the render layer is showing stale cached data, while the data layer contains the correct value from the imported file
