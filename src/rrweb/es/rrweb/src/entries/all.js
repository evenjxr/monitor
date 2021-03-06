export { EventType, IncrementalSource, MouseInteractions, ReplayerEvents } from '../types.js';
import * as utils from '../utils.js';
export { utils };
export { _mirror as mirror } from '../utils.js';
export { default as record } from '../record/index.js';
export { Replayer } from '../replay/index.js';
export { addCustomEvent, freezePage } from '../index.js';
export { pack } from '../packer/pack.js';
export { unpack } from '../packer/unpack.js';
export { PLUGIN_NAME, getRecordConsolePlugin } from '../plugins/console/record/index.js';
export { getReplayConsolePlugin } from '../plugins/console/replay/index.js';
