# rx-form-data

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d148e1b923fa4a6a9094458356f97379)](https://app.codacy.com/manual/ahmedt/rx-form-data?utm_source=github.com&utm_medium=referral&utm_content=ahmedtadde/rx-form-data&utm_campaign=Badge_Grade_Dashboard)
[![Known Vulnerabilities](https://snyk.io/test/github/ahmedtadde/rx-form-data/badge.svg)](https://snyk.io/test/github/ahmedtadde/rx-form-data)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@metronlabs/rx-form-data)
![dependencies status](https://img.shields.io/david/ahmedtadde/rx-form-data)
![dev dependencies status](https://img.shields.io/david/dev/ahmedtadde/rx-form-data)
![npm](https://img.shields.io/npm/dt/@metronlabs/rx-form-data)

> Minimal, Reactive Form data handling

- **Fully written in Typescript**
- **Turns form into a signal of field values (user input & some metadata)**
- **Framework Agnostic**
- **Easy integration with any custom validation logic**
- **Super tiny with ZERO dependencies**

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
npm install --save @metronlabs/rx-form-data
```

```typescript
// using ES6 modules
import RxFormData from "@metronlabs/rx-form-data";

// using CommonJS modules
const RxFormData = require("@metronlabs/rx-form-data");
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/@metronlabs/rx-form-data/lib/index.umd.js"></script>
```

You can find the library on `window.RxFormData`.

## Usage

```typescript
import RxFormData from "@metronlabs/rx-form-data";
const { subscribe, register, dispatch, ACTION_TYPE } = RxFormData(
  "some-form-id",
  // form submission handler. This is required.
  (formvalues, formvalidation, formdata) => {
    // do some custom logic before XHR/AJAX calls... formdata is an HTML5 FormData object of the `some-form-id` form element
    console.log(
      "ON SUBMIT HANDLER CALLED",
      formvalues,
      formvalidation,
      formdata
    );
    return Promise.resolve([formvalues]);
  }
);

//Registers all the input fields on the `some-form-id` form element
dispatch(ACTION_TYPE.REGISTER_ALL);

//Alternatively, you can  choose which fields to register
//That can be done this way ...
dispatch(ATION_TYPE.REGISTER, ["some-field-x", "some-field-y"]);
// OR, this way
const unregister = register(["some-field-x", "some-field-y"]);
// ^ advantage of the later is that you get the 'unregister' function;

//For validation, add some decoders.
//A decoder has a name/label, a bunch of predicates with formvalues as input, and (static or computed) error messages
dispatch(ACTION_TYPE.ADD_DECODERS, [
  {
    name: "validation-for-some-field-x",
    use: [
      (formvalues) => {
        //...some logic
        return true; // if returned value is not 'true' <=> validation failed!
      }
    ],
    messages: ["Input is invalid"] // this can also be a function (context) => string | string[]
  }
]);

const unsubscribe = subscribe((formvalues, formvalidation) => {
  //formvalues includes data for all the currently registered fields
  //formvalidation is derived from formvalues and the registered decoders...
  console.info("FORM DATA SUBSCRIBER", formvalues, formvalidation);
});

// You can have more than one subscriber (...just dont go crazy with it; all things in moderation and all)
const unsubscribe2 = subscribe((formvalues, formvalidation) => {
  console.info("FORM DATA SUBSCRIBER II", formvalues, formvalidation);
});

// some time later... when y'er done
setTimeout(() => {
  unsubscribe();
  unsubscribe2();
}, 2 * 60 * 1000);

setTimeout(() => {
  // clean up: unmounts all form element listners, dettaches all subscribers, clears registered fields & decoders...
  dispatch(ACTION_TYPE.DESTROY);
}, 3 * 60 * 1000);
```

## API

Scan the type declarations (`@types` folder) for some insights on implementation details:

- `RxFormData`
  Main package function. Use this to create an RxFormData instance.

```typescript
const { subscribe, register, dispatch, ACTION_TYPE } = RxFormData(
  "...",
  // Form submission handler...
  // Keep in mind, you are fully responsible for how to handle this event.
  // All this library does is give you enough information to know what to do
  // The formdata parameter is the FormData object of the form element at the moment a submission is triggered
  (formvalues, formvalidation, formdata) => {...}
);
```

- `subscribe`
  Sets up subscriptions to form values and form validation updates. Takes a function as argument.

```typescript
 const unsubscribe = subscribe((formvalues, formvalidation) => {...});

 //when subscription is no longer needed...
 unsubscribe()

```

- `register`
  Registers form field elements. Accepts a list of field names or regex expressions that are meant to match one or multiple field names.

```typescript
const unregister = register(["username", "email", /^password.*/]);

//when you no longer care about the fields...
unregister();
//Or to keep these fields in the form values
unregister(true);
```

- `dispatch` & `ACTION_TYPE`
  Utilities to interface with the RxFormData instance

```typescript
//List of available actions
{
  REGISTER: "REGISTER_FIELDS",
  REGISTER_ALL: "REGISTER_ALL_FIELDS",
  UNREGISTER: "UNREGISTER_FIELDS",
  UNREGISTER_ALL: "UNREGISTER_ALL_FIELDS",
  ADD_DECODERS: "ADD_DECODERS",
  REMOVE_DECODERS: "REMOVE_DECODERS",
  CLEAR_DECODERS: "CLEAR_DECODERS",
  DESTROY: "DESTROY_PROGRAM"
};

dispatch(ACTION_TYPE.REGISTER, payload: Array<string | RegExp>);

dispatch(ACTION_TYPE.REGISTER_ALL); // registers all fields currently on the form elment

dispatch(ACTION_TYPE.UNREGISTER, payload: Array<string | RegExp>); // keepvalues is set to false by default
dispatch(ACTION_TYPE.UNREGISTER, payload: { use: payload: Array<string | RegExp>, keepvalues: boolean });

dispatch(ACTION_TYPE.UNREGISTER_ALL, keepvalues?: boolean);

dispatch(ACTION_TYPE.ADD_DECODERS, payload: Array<{
  /** this is used as key on the formvalidaiton object */
  name: string;
  /** predicate functions (i.e validators) */
  use: Array<(formvalues: Readonly<Record<string, ...>>) => boolean>;
  /** error messages for validation failure(s) */
  messages: string[] | (context: Record<string, unknown>) => string | string[];
}>);

dispatch(ACTION_TYPE.REMOVE_DECODERS, payload: Array<string | RegExp>);


dispatch(ACTION_TYPE.CLEAR_DECODERS); // clears all registered decoders

dispatch(ACTION_TYPE.DESTROY); // basically renders RxFormData inert
```

## Contribute

First off, thanks for taking the time to contribute!
Now, take a moment to be sure your contributions make sense to everyone else.

### Reporting Issues

Found a problem? Want a new feature? First of all see if your issue or idea has [already been reported](../../issues).
If not, just open a [new clear and descriptive issue](../../issues/new).

### Submitting pull requests

Pull requests are the greatest contributions, so be sure they are focused in scope, and do avoid unrelated commits.

- Fork it!
- Clone your fork: `git clone https://github.com/<your-username>/@metronlabs/rx-form-data`
- Navigate to the newly cloned directory: `cd @metronlabs/rx-form-data`
- Create a new branch for the new feature: `git checkout -b features/my-new-feature`
- Install the tools necessary for development: `npm install`
- Make your changes.
- Commit your changes: `git commit -am 'Add some feature'`
- Push to the branch: `git push origin features/my-new-feature`
- Submit a pull request with full remarks documenting your changes.

## License

[MIT License](https://opensource.org/licenses/MIT) © [Ahmed Tadde](https://github.com/ahmedtadde)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice aTd this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
