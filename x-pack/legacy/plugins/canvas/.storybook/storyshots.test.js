/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import path from 'path';
import moment from 'moment';
import 'moment-timezone';

import initStoryshots, { multiSnapshotWithOptions } from '@storybook/addon-storyshots';
import styleSheetSerializer from 'jest-styled-components/src/styleSheetSerializer';
import { addSerializer } from 'jest-specific-snapshot';

// Set our default timezone to UTC for tests so we can generate predictable snapshots
moment.tz.setDefault('UTC');

// Mock EUI generated ids to be consistently predictable for snapshots.
jest.mock(`@elastic/eui/lib/components/form/form_row/make_id`, () => () => `generated-id`);

// Jest automatically mocks SVGs to be a plain-text string that isn't an SVG.  Canvas uses
// them in examples, so let's mock a few for tests.
jest.mock('../canvas_plugin_src/renderers/shape/shapes', () => ({
  shapes: {
    arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="0,40 60,40 60,20 95,50 60,80 60,60 0,60" />
    </svg>`,
    square: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="0" y="0" width="100" height="100" />
    </svg>`,
  },
}));

// Mock datetime parsing so we can get stable results for tests (even while using the `now` format)
jest.mock('@elastic/datemath', () => {
  return {
    parse: (d, opts) => {
      const dateMath = jest.requireActual('@elastic/datemath');
      return dateMath.parse(d, { ...opts, forceNow: new Date(Date.UTC(2019, 5, 1)) }); // June 1 2019
    },
  };
});

// Mock react-datepicker dep used by eui to avoid rendering the entire large component
jest.mock('@elastic/eui/packages/react-datepicker', () => {
  return {
    __esModule: true,
    default: 'ReactDatePicker',
  };
});

addSerializer(styleSheetSerializer);

// Initialize Storyshots and build the Jest Snapshots
initStoryshots({
  configPath: path.resolve(__dirname, './../.storybook'),
  test: multiSnapshotWithOptions({}),
});
