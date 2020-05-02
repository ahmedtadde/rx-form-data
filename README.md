# rx-form-data

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
npm install --save rx-form-data
```

Then with a module bundler like [rollup](http://rollupjs.org/) or [webpack](https://webpack.js.org/), use as you would anything else:

```javascript
// using ES6 modules
import RxFormData from "rx-form-data";

// using CommonJS modules
const RxFormData = require("rx-form-data");
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/rx-form-data/lib/umd/index.js"></script>
```

You can find the library on `window.RxFormData`.

## Usage

```typescript
import RxFormData from "rx-form-data";
const { subscribe, dispatch, ACTION_TYPE } = RxFormData(
  "some-form-id",
  (formvalues, formdata) => {
    console.log("ON SUBMIT HANDLER CALLED", formvalues, formdata);
    return Promise.resolve([formvalues]);
  }
);

const unsubscribe = subscribe((formvalues) => {
  console.debug("FORM VALUES SUBSCRIBER", formvalues);
});

setTimeout(() => {
  unsubscribe();
}, 2 * 60 * 1000);

setTimeout(() => {
  dispatch(ACTION_TYPE.DESTROY);
}, 3 * 60 * 1000);
```

## Contribute

First off, thanks for taking the time to contribute!
Now, take a moment to be sure your contributions make sense to everyone else.

### Reporting Issues

Found a problem? Want a new feature? First of all see if your issue or idea has [already been reported](../../issues).
If don't, just open a [new clear and descriptive issue](../../issues/new).

### Submitting pull requests

Pull requests are the greatest contributions, so be sure they are focused in scope, and do avoid unrelated commits.

- Fork it!
- Clone your fork: `git clone https://github.com/<your-username>/rx-form-data`
- Navigate to the newly cloned directory: `cd rx-form-data`
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
