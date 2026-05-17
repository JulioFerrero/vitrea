var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _internal, _buildCache, _additionalStyles, _getBuildCache, _commands, _onError;
function checkWindows() {
  const global2 = globalThis;
  const os = global2.Deno?.build?.os;
  return typeof os === "string" ? os === "windows" : global2.navigator?.platform?.startsWith("Win") ?? global2.process?.platform?.startsWith("win") ?? false;
}
const isWindows = checkWindows();
function assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
  }
}
function assertArg$1(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol !== "file:") {
    throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
  }
  return url;
}
function fromFileUrl$2(url) {
  url = assertArg$1(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
const CHAR_UPPERCASE_A = 65;
const CHAR_LOWERCASE_A = 97;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_Z = 122;
const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_COLON = 58;
function isPosixPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH;
}
function isPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH || code2 === CHAR_BACKWARD_SLASH;
}
function isWindowsDeviceRoot(code2) {
  return code2 >= CHAR_LOWERCASE_A && code2 <= CHAR_LOWERCASE_Z || code2 >= CHAR_UPPERCASE_A && code2 <= CHAR_UPPERCASE_Z;
}
function fromFileUrl$1(url) {
  url = assertArg$1(url);
  let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname !== "") {
    path = `\\\\${url.hostname}${path}`;
  }
  return path;
}
function fromFileUrl(url) {
  return isWindows ? fromFileUrl$1(url) : fromFileUrl$2(url);
}
function isAbsolute$2(path) {
  assertPath(path);
  return path.length > 0 && isPosixPathSeparator(path.charCodeAt(0));
}
function isAbsolute$1(path) {
  assertPath(path);
  const len = path.length;
  if (len === 0) return false;
  const code2 = path.charCodeAt(0);
  if (isPathSeparator(code2)) {
    return true;
  } else if (isWindowsDeviceRoot(code2)) {
    if (len > 2 && path.charCodeAt(1) === CHAR_COLON) {
      if (isPathSeparator(path.charCodeAt(2))) return true;
    }
  }
  return false;
}
function isAbsolute(path) {
  return isWindows ? isAbsolute$1(path) : isAbsolute$2(path);
}
function assertArg(path) {
  assertPath(path);
  if (path.length === 0) return ".";
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code2;
  for (let i2 = 0; i2 <= path.length; ++i2) {
    if (i2 < path.length) code2 = path.charCodeAt(i2);
    else if (isPathSeparator2(code2)) break;
    else code2 = CHAR_FORWARD_SLASH;
    if (isPathSeparator2(code2)) {
      if (lastSlash === i2 - 1 || dots === 1) ;
      else if (lastSlash !== i2 - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i2;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i2;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += `${separator}..`;
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += separator + path.slice(lastSlash + 1, i2);
        else res = path.slice(lastSlash + 1, i2);
        lastSegmentLength = i2 - lastSlash - 1;
      }
      lastSlash = i2;
      dots = 0;
    } else if (code2 === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function normalize$1(path) {
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  assertArg(path);
  const isAbsolute2 = isPosixPathSeparator(path.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator(path.charCodeAt(path.length - 1));
  path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
  if (path.length === 0 && !isAbsolute2) path = ".";
  if (path.length > 0 && trailingSeparator) path += "/";
  if (isAbsolute2) return `/${path}`;
  return path;
}
function join$2(path, ...paths) {
  if (path === void 0) return ".";
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath(path2));
  const joined = paths.filter((path2) => path2.length > 0).join("/");
  return joined === "" ? "." : normalize$1(joined);
}
function normalize(path) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  assertArg(path);
  const len = path.length;
  let rootEnd = 0;
  let device;
  let isAbsolute2 = false;
  const code2 = path.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code2)) {
      isAbsolute2 = true;
      if (isPathSeparator(path.charCodeAt(1))) {
        let j2 = 2;
        let last = j2;
        for (; j2 < len; ++j2) {
          if (isPathSeparator(path.charCodeAt(j2))) break;
        }
        if (j2 < len && j2 !== last) {
          const firstPart = path.slice(last, j2);
          last = j2;
          for (; j2 < len; ++j2) {
            if (!isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            last = j2;
            for (; j2 < len; ++j2) {
              if (isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 === len) {
              return `\\\\${firstPart}\\${path.slice(last)}\\`;
            } else if (j2 !== last) {
              device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
              rootEnd = j2;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot(code2)) {
      if (path.charCodeAt(1) === CHAR_COLON) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
      }
    }
  } else if (isPathSeparator(code2)) {
    return "\\";
  }
  let tail;
  if (rootEnd < len) {
    tail = normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
  } else {
    tail = "";
  }
  if (tail.length === 0 && !isAbsolute2) tail = ".";
  if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
    tail += "\\";
  }
  if (device === void 0) {
    if (isAbsolute2) {
      if (tail.length > 0) return `\\${tail}`;
      else return "\\";
    }
    return tail;
  } else if (isAbsolute2) {
    if (tail.length > 0) return `${device}\\${tail}`;
    else return `${device}\\`;
  }
  return device + tail;
}
function join$1(path, ...paths) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath(path2));
  paths = paths.filter((path2) => path2.length > 0);
  if (paths.length === 0) return ".";
  let needsReplace = true;
  let slashCount = 0;
  const firstPart = paths[0];
  if (isPathSeparator(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
          else {
            needsReplace = false;
          }
        }
      }
    }
  }
  let joined = paths.join("\\");
  if (needsReplace) {
    for (; slashCount < joined.length; ++slashCount) {
      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
    }
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return normalize(joined);
}
function join(path, ...paths) {
  return isWindows ? join$1(path, ...paths) : join$2(path, ...paths);
}
function resolve$1(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
    let path;
    if (i2 >= 0) path = pathSegments[i2];
    else {
      const {
        Deno: Deno2
      } = globalThis;
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a current working directory (CWD)");
      }
      path = Deno2.cwd();
    }
    assertPath(path);
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
function assertArgs(from, to) {
  assertPath(from);
  assertPath(to);
  if (from === to) return "";
}
function relative$2(from, to) {
  assertArgs(from, to);
  from = resolve$1(from);
  to = resolve$1(to);
  if (from === to) return "";
  let fromStart = 1;
  const fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 1;
  const toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (!isPosixPathSeparator(to.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (isPosixPathSeparator(to.charCodeAt(toStart + i2))) {
          return to.slice(toStart + i2 + 1);
        } else if (i2 === 0) {
          return to.slice(toStart + i2);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator(from.charCodeAt(fromStart + i2))) {
          lastCommonSep = i2;
        } else if (i2 === 0) {
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator(fromCode)) lastCommonSep = i2;
  }
  let out = "";
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || isPosixPathSeparator(from.charCodeAt(i2))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator(to.charCodeAt(toStart))) ++toStart;
    return to.slice(toStart);
  }
}
function resolve(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1; i2--) {
    let path;
    const {
      Deno: Deno2
    } = globalThis;
    if (i2 >= 0) {
      path = pathSegments[i2];
    } else if (!resolvedDevice) {
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a drive-letter-less path without a current working directory (CWD)");
      }
      path = Deno2.cwd();
    } else {
      if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a current working directory (CWD)");
      }
      path = Deno2.cwd();
      if (path === void 0 || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path = `${resolvedDevice}\\`;
      }
    }
    assertPath(path);
    const len = path.length;
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute2 = false;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
      if (isPathSeparator(code2)) {
        isAbsolute2 = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j2 = 2;
          let last = j2;
          for (; j2 < len; ++j2) {
            if (isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            const firstPart = path.slice(last, j2);
            last = j2;
            for (; j2 < len; ++j2) {
              if (!isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 < len && j2 !== last) {
              last = j2;
              for (; j2 < len; ++j2) {
                if (isPathSeparator(path.charCodeAt(j2))) break;
              }
              if (j2 === len) {
                device = `\\\\${firstPart}\\${path.slice(last)}`;
                rootEnd = j2;
              } else if (j2 !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                rootEnd = j2;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code2)) {
        if (path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator(code2)) {
      rootEnd = 1;
      isAbsolute2 = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute2;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function relative$1(from, to) {
  assertArgs(from, to);
  const fromOrig = resolve(from);
  const toOrig = resolve(to);
  if (fromOrig === toOrig) return "";
  from = fromOrig.toLowerCase();
  to = toOrig.toLowerCase();
  if (from === to) return "";
  let fromStart = 0;
  let fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; fromEnd - 1 > fromStart; --fromEnd) {
    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 0;
  let toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; toEnd - 1 > toStart; --toEnd) {
    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i2) === CHAR_BACKWARD_SLASH) {
          return toOrig.slice(toStart + i2 + 1);
        } else if (i2 === 2) {
          return toOrig.slice(toStart + i2);
        }
      }
      if (fromLen > length) {
        if (from.charCodeAt(fromStart + i2) === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i2;
        } else if (i2 === 2) {
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i2;
  }
  if (i2 !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || from.charCodeAt(i2) === CHAR_BACKWARD_SLASH) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}
function relative(from, to) {
  return isWindows ? relative$1(from, to) : relative$2(from, to);
}
var exports$S = {};
Object.defineProperty(exports$S, "__esModule", {
  value: true
});
Object.defineProperty(exports$S, "__esModule", {
  value: true
});
exports$S.VERSION = void 0;
exports$S.VERSION = "1.9.1";
var _VERSION = exports$S.VERSION;
var _default$N;
if (typeof exports$S === "object" && exports$S !== null && "default" in exports$S) {
  _default$N = exports$S.default;
} else {
  _default$N = exports$S;
}
const _default_default$M = _default$N;
var __require$M = exports$S;
exports$S.__esModule;
const _mod$j = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  VERSION: _VERSION,
  __require: __require$M,
  default: _default_default$M
}, Symbol.toStringTag, { value: "Module" }));
var exports$R = {};
Object.defineProperty(exports$R, "__esModule", {
  value: true
});
Object.defineProperty(exports$R, "__esModule", {
  value: true
});
const version_1$1 = __require$M ?? _default_default$M ?? _mod$j;
const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function _makeCompatibilityCheck(ownVersion) {
  const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  const rejectedVersions = /* @__PURE__ */ new Set();
  const myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return () => false;
  }
  const ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v2) {
    rejectedVersions.add(v2);
    return false;
  }
  function _accept(v2) {
    acceptedVersions.add(v2);
    return true;
  }
  return function isCompatible(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    const globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    const globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
exports$R._makeCompatibilityCheck = _makeCompatibilityCheck;
exports$R.isCompatible = _makeCompatibilityCheck(version_1$1.VERSION);
exports$R._makeCompatibilityCheck;
var _isCompatible = exports$R.isCompatible;
var _default$M;
if (typeof exports$R === "object" && exports$R !== null && "default" in exports$R) {
  _default$M = exports$R.default;
} else {
  _default$M = exports$R;
}
const _default_default$L = _default$M;
var __require$L = exports$R;
exports$R.__esModule;
const _mod2$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$L,
  default: _default_default$L,
  isCompatible: _isCompatible
}, Symbol.toStringTag, { value: "Module" }));
var exports$Q = {};
Object.defineProperty(exports$Q, "__esModule", {
  value: true
});
Object.defineProperty(exports$Q, "__esModule", {
  value: true
});
const version_1 = __require$M ?? _default_default$M ?? _mod$j;
const semver_1 = __require$L ?? _default_default$L ?? _mod2$7;
const major = version_1.VERSION.split(".")[0];
const GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
const _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
function registerGlobal(type, instance, diag2, allowOverride = false) {
  var _a;
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
    version: version_1.VERSION
  };
  if (!allowOverride && api[type]) {
    const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  if (api.version !== version_1.VERSION) {
    const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${version_1.VERSION}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag2.debug(`@opentelemetry/api: Registered a global for ${type} v${version_1.VERSION}.`);
  return true;
}
exports$Q.registerGlobal = registerGlobal;
function getGlobal(type) {
  var _a, _b;
  const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
  if (!globalVersion || !(0, semver_1.isCompatible)(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
exports$Q.getGlobal = getGlobal;
function unregisterGlobal(type, diag2) {
  diag2.debug(`@opentelemetry/api: Unregistering a global for ${type} v${version_1.VERSION}.`);
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}
exports$Q.unregisterGlobal = unregisterGlobal;
var _registerGlobal = exports$Q.registerGlobal;
var _getGlobal = exports$Q.getGlobal;
var _unregisterGlobal = exports$Q.unregisterGlobal;
var _default$L;
if (typeof exports$Q === "object" && exports$Q !== null && "default" in exports$Q) {
  _default$L = exports$Q.default;
} else {
  _default$L = exports$Q;
}
const _default_default$K = _default$L;
var __require$K = exports$Q;
exports$Q.__esModule;
const _mod2$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$K,
  default: _default_default$K,
  getGlobal: _getGlobal,
  registerGlobal: _registerGlobal,
  unregisterGlobal: _unregisterGlobal
}, Symbol.toStringTag, { value: "Module" }));
var exports$P = {};
Object.defineProperty(exports$P, "__esModule", {
  value: true
});
Object.defineProperty(exports$P, "__esModule", {
  value: true
});
exports$P.DiagLogLevel = void 0;
(function(DiagLogLevel) {
  DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
  DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
  DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
  DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
  DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
  DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
  DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
})(exports$P.DiagLogLevel || (exports$P.DiagLogLevel = {}));
var _DiagLogLevel = exports$P.DiagLogLevel;
var _default$K;
if (typeof exports$P === "object" && exports$P !== null && "default" in exports$P) {
  _default$K = exports$P.default;
} else {
  _default$K = exports$P;
}
const _default_default$J = _default$K;
var __require$J = exports$P;
exports$P.__esModule;
const _mod4$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagLogLevel: _DiagLogLevel,
  __require: __require$J,
  default: _default_default$J
}, Symbol.toStringTag, { value: "Module" }));
var exports$O = {};
Object.defineProperty(exports$O, "__esModule", {
  value: true
});
Object.defineProperty(exports$O, "__esModule", {
  value: true
});
exports$O.createLogLevelDiagLogger = void 0;
const types_1$2 = __require$J ?? _default_default$J ?? _mod4$2;
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < types_1$2.DiagLogLevel.NONE) {
    maxLevel = types_1$2.DiagLogLevel.NONE;
  } else if (maxLevel > types_1$2.DiagLogLevel.ALL) {
    maxLevel = types_1$2.DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    const theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function() {
    };
  }
  return {
    error: _filterFunc("error", types_1$2.DiagLogLevel.ERROR),
    warn: _filterFunc("warn", types_1$2.DiagLogLevel.WARN),
    info: _filterFunc("info", types_1$2.DiagLogLevel.INFO),
    debug: _filterFunc("debug", types_1$2.DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", types_1$2.DiagLogLevel.VERBOSE)
  };
}
exports$O.createLogLevelDiagLogger = createLogLevelDiagLogger;
var _createLogLevelDiagLogger = exports$O.createLogLevelDiagLogger;
var _default$J;
if (typeof exports$O === "object" && exports$O !== null && "default" in exports$O) {
  _default$J = exports$O.default;
} else {
  _default$J = exports$O;
}
const _default_default$I = _default$J;
var __require$I = exports$O;
exports$O.__esModule;
const _mod2$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$I,
  createLogLevelDiagLogger: _createLogLevelDiagLogger,
  default: _default_default$I
}, Symbol.toStringTag, { value: "Module" }));
var exports$N = {};
Object.defineProperty(exports$N, "__esModule", {
  value: true
});
Object.defineProperty(exports$N, "__esModule", {
  value: true
});
exports$N.DiagComponentLogger = void 0;
const global_utils_1$5 = __require$K ?? _default_default$K ?? _mod2$6;
class DiagComponentLogger {
  constructor(props) {
    this._namespace = props.namespace || "DiagComponentLogger";
  }
  debug(...args) {
    return logProxy("debug", this._namespace, args);
  }
  error(...args) {
    return logProxy("error", this._namespace, args);
  }
  info(...args) {
    return logProxy("info", this._namespace, args);
  }
  warn(...args) {
    return logProxy("warn", this._namespace, args);
  }
  verbose(...args) {
    return logProxy("verbose", this._namespace, args);
  }
}
exports$N.DiagComponentLogger = DiagComponentLogger;
function logProxy(funcName, namespace, args) {
  const logger = (0, global_utils_1$5.getGlobal)("diag");
  if (!logger) {
    return;
  }
  return logger[funcName](namespace, ...args);
}
var _DiagComponentLogger = exports$N.DiagComponentLogger;
var _default$I;
if (typeof exports$N === "object" && exports$N !== null && "default" in exports$N) {
  _default$I = exports$N.default;
} else {
  _default$I = exports$N;
}
const _default_default$H = _default$I;
var __require$H = exports$N;
exports$N.__esModule;
const _mod$i = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagComponentLogger: _DiagComponentLogger,
  __require: __require$H,
  default: _default_default$H
}, Symbol.toStringTag, { value: "Module" }));
var exports$M = {};
Object.defineProperty(exports$M, "__esModule", {
  value: true
});
Object.defineProperty(exports$M, "__esModule", {
  value: true
});
exports$M.DiagAPI = void 0;
const ComponentLogger_1 = __require$H ?? _default_default$H ?? _mod$i;
const logLevelLogger_1 = __require$I ?? _default_default$I ?? _mod2$5;
const types_1$1 = __require$J ?? _default_default$J ?? _mod4$2;
const global_utils_1$4 = __require$K ?? _default_default$K ?? _mod2$6;
const API_NAME$4 = "diag";
class DiagAPI {
  /** Get the singleton instance of the DiagAPI API */
  static instance() {
    if (!this._instance) {
      this._instance = new DiagAPI();
    }
    return this._instance;
  }
  /**
   * Private internal constructor
   * @private
   */
  constructor() {
    function _logProxy(funcName) {
      return function(...args) {
        const logger = (0, global_utils_1$4.getGlobal)("diag");
        if (!logger) return;
        return logger[funcName](...args);
      };
    }
    const self2 = this;
    const setLogger = (logger, optionsOrLogLevel = {
      logLevel: types_1$1.DiagLogLevel.INFO
    }) => {
      var _a, _b, _c;
      if (logger === self2) {
        const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
        self2.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
        return false;
      }
      if (typeof optionsOrLogLevel === "number") {
        optionsOrLogLevel = {
          logLevel: optionsOrLogLevel
        };
      }
      const oldLogger = (0, global_utils_1$4.getGlobal)("diag");
      const newLogger = (0, logLevelLogger_1.createLogLevelDiagLogger)((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : types_1$1.DiagLogLevel.INFO, logger);
      if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
        const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
        oldLogger.warn(`Current logger will be overwritten from ${stack}`);
        newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
      }
      return (0, global_utils_1$4.registerGlobal)("diag", newLogger, self2, true);
    };
    self2.setLogger = setLogger;
    self2.disable = () => {
      (0, global_utils_1$4.unregisterGlobal)(API_NAME$4, self2);
    };
    self2.createComponentLogger = (options2) => {
      return new ComponentLogger_1.DiagComponentLogger(options2);
    };
    self2.verbose = _logProxy("verbose");
    self2.debug = _logProxy("debug");
    self2.info = _logProxy("info");
    self2.warn = _logProxy("warn");
    self2.error = _logProxy("error");
  }
}
exports$M.DiagAPI = DiagAPI;
var _DiagAPI = exports$M.DiagAPI;
var _default$H;
if (typeof exports$M === "object" && exports$M !== null && "default" in exports$M) {
  _default$H = exports$M.default;
} else {
  _default$H = exports$M;
}
const _default_default$G = _default$H;
var __require$G = exports$M;
exports$M.__esModule;
const _mod$h = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagAPI: _DiagAPI,
  __require: __require$G,
  default: _default_default$G
}, Symbol.toStringTag, { value: "Module" }));
var exports$L = {};
Object.defineProperty(exports$L, "__esModule", {
  value: true
});
Object.defineProperty(exports$L, "__esModule", {
  value: true
});
function createContextKey(description) {
  return Symbol.for(description);
}
exports$L.createContextKey = createContextKey;
class BaseContext {
  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  constructor(parentContext) {
    const self2 = this;
    self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
    self2.getValue = (key) => self2._currentContext.get(key);
    self2.setValue = (key, value) => {
      const context = new BaseContext(self2._currentContext);
      context._currentContext.set(key, value);
      return context;
    };
    self2.deleteValue = (key) => {
      const context = new BaseContext(self2._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }
}
exports$L.ROOT_CONTEXT = new BaseContext();
var _createContextKey = exports$L.createContextKey;
var _ROOT_CONTEXT = exports$L.ROOT_CONTEXT;
var _default$G;
if (typeof exports$L === "object" && exports$L !== null && "default" in exports$L) {
  _default$G = exports$L.default;
} else {
  _default$G = exports$L;
}
const _default_default$F = _default$G;
var __require$F = exports$L;
exports$L.__esModule;
const _mod2$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ROOT_CONTEXT: _ROOT_CONTEXT,
  __require: __require$F,
  createContextKey: _createContextKey,
  default: _default_default$F
}, Symbol.toStringTag, { value: "Module" }));
var exports$K = {};
Object.defineProperty(exports$K, "__esModule", {
  value: true
});
Object.defineProperty(exports$K, "__esModule", {
  value: true
});
exports$K.NoopContextManager = void 0;
const context_1$5 = __require$F ?? _default_default$F ?? _mod2$4;
class NoopContextManager {
  active() {
    return context_1$5.ROOT_CONTEXT;
  }
  with(_context2, fn2, thisArg, ...args) {
    return fn2.call(thisArg, ...args);
  }
  bind(_context2, target) {
    return target;
  }
  enable() {
    return this;
  }
  disable() {
    return this;
  }
}
exports$K.NoopContextManager = NoopContextManager;
var _NoopContextManager = exports$K.NoopContextManager;
var _default$F;
if (typeof exports$K === "object" && exports$K !== null && "default" in exports$K) {
  _default$F = exports$K.default;
} else {
  _default$F = exports$K;
}
const _default_default$E = _default$F;
var __require$E = exports$K;
exports$K.__esModule;
const _mod$g = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopContextManager: _NoopContextManager,
  __require: __require$E,
  default: _default_default$E
}, Symbol.toStringTag, { value: "Module" }));
var exports$J = {};
Object.defineProperty(exports$J, "__esModule", {
  value: true
});
Object.defineProperty(exports$J, "__esModule", {
  value: true
});
exports$J.ContextAPI = void 0;
const NoopContextManager_1 = __require$E ?? _default_default$E ?? _mod$g;
const global_utils_1$3 = __require$K ?? _default_default$K ?? _mod2$6;
const diag_1$5 = __require$G ?? _default_default$G ?? _mod$h;
const API_NAME$3 = "context";
const NOOP_CONTEXT_MANAGER = new NoopContextManager_1.NoopContextManager();
class ContextAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Context API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new ContextAPI();
    }
    return this._instance;
  }
  /**
   * Set the current context manager.
   *
   * @returns true if the context manager was successfully registered, else false
   */
  setGlobalContextManager(contextManager) {
    return (0, global_utils_1$3.registerGlobal)(API_NAME$3, contextManager, diag_1$5.DiagAPI.instance());
  }
  /**
   * Get the currently active context
   */
  active() {
    return this._getContextManager().active();
  }
  /**
   * Execute a function with an active context
   *
   * @param context context to be active during function execution
   * @param fn function to execute in a context
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  with(context, fn2, thisArg, ...args) {
    return this._getContextManager().with(context, fn2, thisArg, ...args);
  }
  /**
   * Bind a context to a target function or event emitter
   *
   * @param context context to bind to the event emitter or function. Defaults to the currently active context
   * @param target function or event emitter to bind
   */
  bind(context, target) {
    return this._getContextManager().bind(context, target);
  }
  _getContextManager() {
    return (0, global_utils_1$3.getGlobal)(API_NAME$3) || NOOP_CONTEXT_MANAGER;
  }
  /** Disable and remove the global context manager */
  disable() {
    this._getContextManager().disable();
    (0, global_utils_1$3.unregisterGlobal)(API_NAME$3, diag_1$5.DiagAPI.instance());
  }
}
exports$J.ContextAPI = ContextAPI;
var _ContextAPI = exports$J.ContextAPI;
var _default$E;
if (typeof exports$J === "object" && exports$J !== null && "default" in exports$J) {
  _default$E = exports$J.default;
} else {
  _default$E = exports$J;
}
const _default_default$D = _default$E;
var __require$D = exports$J;
exports$J.__esModule;
const _mod$f = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ContextAPI: _ContextAPI,
  __require: __require$D,
  default: _default_default$D
}, Symbol.toStringTag, { value: "Module" }));
var exports$I = {};
Object.defineProperty(exports$I, "__esModule", {
  value: true
});
Object.defineProperty(exports$I, "__esModule", {
  value: true
});
exports$I.TraceFlags = void 0;
(function(TraceFlags) {
  TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
  TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(exports$I.TraceFlags || (exports$I.TraceFlags = {}));
var _TraceFlags = exports$I.TraceFlags;
var _default$D;
if (typeof exports$I === "object" && exports$I !== null && "default" in exports$I) {
  _default$D = exports$I.default;
} else {
  _default$D = exports$I;
}
const _default_default$C = _default$D;
var __require$C = exports$I;
exports$I.__esModule;
const _mod11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceFlags: _TraceFlags,
  __require: __require$C,
  default: _default_default$C
}, Symbol.toStringTag, { value: "Module" }));
var exports$H = {};
Object.defineProperty(exports$H, "__esModule", {
  value: true
});
Object.defineProperty(exports$H, "__esModule", {
  value: true
});
const trace_flags_1$1 = __require$C ?? _default_default$C ?? _mod11;
exports$H.INVALID_SPANID = "0000000000000000";
exports$H.INVALID_TRACEID = "00000000000000000000000000000000";
exports$H.INVALID_SPAN_CONTEXT = {
  traceId: exports$H.INVALID_TRACEID,
  spanId: exports$H.INVALID_SPANID,
  traceFlags: trace_flags_1$1.TraceFlags.NONE
};
var _INVALID_SPANID = exports$H.INVALID_SPANID;
var _INVALID_TRACEID = exports$H.INVALID_TRACEID;
var _INVALID_SPAN_CONTEXT = exports$H.INVALID_SPAN_CONTEXT;
var _default$C;
if (typeof exports$H === "object" && exports$H !== null && "default" in exports$H) {
  _default$C = exports$H.default;
} else {
  _default$C = exports$H;
}
const _default_default$B = _default$C;
var __require$B = exports$H;
exports$H.__esModule;
const _mod14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  INVALID_SPANID: _INVALID_SPANID,
  INVALID_SPAN_CONTEXT: _INVALID_SPAN_CONTEXT,
  INVALID_TRACEID: _INVALID_TRACEID,
  __require: __require$B,
  default: _default_default$B
}, Symbol.toStringTag, { value: "Module" }));
var exports$G = {};
Object.defineProperty(exports$G, "__esModule", {
  value: true
});
Object.defineProperty(exports$G, "__esModule", {
  value: true
});
exports$G.NonRecordingSpan = void 0;
const invalid_span_constants_1$2 = __require$B ?? _default_default$B ?? _mod14;
class NonRecordingSpan {
  constructor(spanContext = invalid_span_constants_1$2.INVALID_SPAN_CONTEXT) {
    this._spanContext = spanContext;
  }
  // Returns a SpanContext.
  spanContext() {
    return this._spanContext;
  }
  // By default does nothing
  setAttribute(_key, _value) {
    return this;
  }
  // By default does nothing
  setAttributes(_attributes) {
    return this;
  }
  // By default does nothing
  addEvent(_name, _attributes) {
    return this;
  }
  addLink(_link) {
    return this;
  }
  addLinks(_links) {
    return this;
  }
  // By default does nothing
  setStatus(_status) {
    return this;
  }
  // By default does nothing
  updateName(_name) {
    return this;
  }
  // By default does nothing
  end(_endTime) {
  }
  // isRecording always returns false for NonRecordingSpan.
  isRecording() {
    return false;
  }
  // By default does nothing
  recordException(_exception, _time) {
  }
}
exports$G.NonRecordingSpan = NonRecordingSpan;
var _NonRecordingSpan = exports$G.NonRecordingSpan;
var _default$B;
if (typeof exports$G === "object" && exports$G !== null && "default" in exports$G) {
  _default$B = exports$G.default;
} else {
  _default$B = exports$G;
}
const _default_default$A = _default$B;
var __require$A = exports$G;
exports$G.__esModule;
const _mod3$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NonRecordingSpan: _NonRecordingSpan,
  __require: __require$A,
  default: _default_default$A
}, Symbol.toStringTag, { value: "Module" }));
var exports$F = {};
Object.defineProperty(exports$F, "__esModule", {
  value: true
});
Object.defineProperty(exports$F, "__esModule", {
  value: true
});
const context_1$4 = __require$F ?? _default_default$F ?? _mod2$4;
const NonRecordingSpan_1$2 = __require$A ?? _default_default$A ?? _mod3$2;
const context_2$1 = __require$D ?? _default_default$D ?? _mod$f;
const SPAN_KEY = (0, context_1$4.createContextKey)("OpenTelemetry Context Key SPAN");
function getSpan(context) {
  return context.getValue(SPAN_KEY) || void 0;
}
exports$F.getSpan = getSpan;
function getActiveSpan() {
  return getSpan(context_2$1.ContextAPI.getInstance().active());
}
exports$F.getActiveSpan = getActiveSpan;
function setSpan(context, span) {
  return context.setValue(SPAN_KEY, span);
}
exports$F.setSpan = setSpan;
function deleteSpan(context) {
  return context.deleteValue(SPAN_KEY);
}
exports$F.deleteSpan = deleteSpan;
function setSpanContext(context, spanContext) {
  return setSpan(context, new NonRecordingSpan_1$2.NonRecordingSpan(spanContext));
}
exports$F.setSpanContext = setSpanContext;
function getSpanContext(context) {
  var _a;
  return (_a = getSpan(context)) === null || _a === void 0 ? void 0 : _a.spanContext();
}
exports$F.getSpanContext = getSpanContext;
var _getSpan = exports$F.getSpan;
var _getActiveSpan = exports$F.getActiveSpan;
var _setSpan = exports$F.setSpan;
var _deleteSpan = exports$F.deleteSpan;
var _setSpanContext = exports$F.setSpanContext;
var _getSpanContext = exports$F.getSpanContext;
var _default$A;
if (typeof exports$F === "object" && exports$F !== null && "default" in exports$F) {
  _default$A = exports$F.default;
} else {
  _default$A = exports$F;
}
const _default_default$z = _default$A;
var __require$z = exports$F;
exports$F.__esModule;
const _mod4$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$z,
  default: _default_default$z,
  deleteSpan: _deleteSpan,
  getActiveSpan: _getActiveSpan,
  getSpan: _getSpan,
  getSpanContext: _getSpanContext,
  setSpan: _setSpan,
  setSpanContext: _setSpanContext
}, Symbol.toStringTag, { value: "Module" }));
var exports$E = {};
Object.defineProperty(exports$E, "__esModule", {
  value: true
});
Object.defineProperty(exports$E, "__esModule", {
  value: true
});
const invalid_span_constants_1$1 = __require$B ?? _default_default$B ?? _mod14;
const NonRecordingSpan_1$1 = __require$A ?? _default_default$A ?? _mod3$2;
const isHex = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
function isValidHex(id, length) {
  if (typeof id !== "string" || id.length !== length) return false;
  let r2 = 0;
  for (let i2 = 0; i2 < id.length; i2 += 4) {
    r2 += (isHex[id.charCodeAt(i2)] | 0) + (isHex[id.charCodeAt(i2 + 1)] | 0) + (isHex[id.charCodeAt(i2 + 2)] | 0) + (isHex[id.charCodeAt(i2 + 3)] | 0);
  }
  return r2 === length;
}
function isValidTraceId(traceId) {
  return isValidHex(traceId, 32) && traceId !== invalid_span_constants_1$1.INVALID_TRACEID;
}
exports$E.isValidTraceId = isValidTraceId;
function isValidSpanId(spanId) {
  return isValidHex(spanId, 16) && spanId !== invalid_span_constants_1$1.INVALID_SPANID;
}
exports$E.isValidSpanId = isValidSpanId;
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
exports$E.isSpanContextValid = isSpanContextValid;
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan_1$1.NonRecordingSpan(spanContext);
}
exports$E.wrapSpanContext = wrapSpanContext;
var _isValidTraceId = exports$E.isValidTraceId;
var _isValidSpanId = exports$E.isValidSpanId;
var _isSpanContextValid$1 = exports$E.isSpanContextValid;
var _wrapSpanContext = exports$E.wrapSpanContext;
var _default$z;
if (typeof exports$E === "object" && exports$E !== null && "default" in exports$E) {
  _default$z = exports$E.default;
} else {
  _default$z = exports$E;
}
const _default_default$y = _default$z;
var __require$y = exports$E;
exports$E.__esModule;
const _mod13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$y,
  default: _default_default$y,
  isSpanContextValid: _isSpanContextValid$1,
  isValidSpanId: _isValidSpanId,
  isValidTraceId: _isValidTraceId,
  wrapSpanContext: _wrapSpanContext
}, Symbol.toStringTag, { value: "Module" }));
var exports$D = {};
Object.defineProperty(exports$D, "__esModule", {
  value: true
});
Object.defineProperty(exports$D, "__esModule", {
  value: true
});
exports$D.NoopTracer = void 0;
const context_1$3 = __require$D ?? _default_default$D ?? _mod$f;
const context_utils_1$1 = __require$z ?? _default_default$z ?? _mod4$1;
const NonRecordingSpan_1 = __require$A ?? _default_default$A ?? _mod3$2;
const spancontext_utils_1$2 = __require$y ?? _default_default$y ?? _mod13;
const contextApi = context_1$3.ContextAPI.getInstance();
class NoopTracer {
  // startSpan starts a noop span.
  startSpan(name, options2, context = contextApi.active()) {
    const root2 = Boolean(options2 === null || options2 === void 0 ? void 0 : options2.root);
    if (root2) {
      return new NonRecordingSpan_1.NonRecordingSpan();
    }
    const parentFromContext = context && (0, context_utils_1$1.getSpanContext)(context);
    if (isSpanContext(parentFromContext) && (0, spancontext_utils_1$2.isSpanContextValid)(parentFromContext)) {
      return new NonRecordingSpan_1.NonRecordingSpan(parentFromContext);
    } else {
      return new NonRecordingSpan_1.NonRecordingSpan();
    }
  }
  startActiveSpan(name, arg2, arg3, arg4) {
    let opts;
    let ctx;
    let fn2;
    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn2 = arg2;
    } else if (arguments.length === 3) {
      opts = arg2;
      fn2 = arg3;
    } else {
      opts = arg2;
      ctx = arg3;
      fn2 = arg4;
    }
    const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = (0, context_utils_1$1.setSpan)(parentContext, span);
    return contextApi.with(contextWithSpanSet, fn2, void 0, span);
  }
}
exports$D.NoopTracer = NoopTracer;
function isSpanContext(spanContext) {
  return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
}
var _NoopTracer = exports$D.NoopTracer;
var _default$y;
if (typeof exports$D === "object" && exports$D !== null && "default" in exports$D) {
  _default$y = exports$D.default;
} else {
  _default$y = exports$D;
}
const _default_default$x = _default$y;
var __require$x = exports$D;
exports$D.__esModule;
const _mod$e = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTracer: _NoopTracer,
  __require: __require$x,
  default: _default_default$x
}, Symbol.toStringTag, { value: "Module" }));
var exports$C = {};
Object.defineProperty(exports$C, "__esModule", {
  value: true
});
Object.defineProperty(exports$C, "__esModule", {
  value: true
});
exports$C.NoopTracerProvider = void 0;
const NoopTracer_1$1 = __require$x ?? _default_default$x ?? _mod$e;
class NoopTracerProvider {
  getTracer(_name, _version, _options) {
    return new NoopTracer_1$1.NoopTracer();
  }
}
exports$C.NoopTracerProvider = NoopTracerProvider;
var _NoopTracerProvider = exports$C.NoopTracerProvider;
var _default$x;
if (typeof exports$C === "object" && exports$C !== null && "default" in exports$C) {
  _default$x = exports$C.default;
} else {
  _default$x = exports$C;
}
const _default_default$w = _default$x;
var __require$w = exports$C;
exports$C.__esModule;
const _mod2$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTracerProvider: _NoopTracerProvider,
  __require: __require$w,
  default: _default_default$w
}, Symbol.toStringTag, { value: "Module" }));
var exports$B = {};
Object.defineProperty(exports$B, "__esModule", {
  value: true
});
Object.defineProperty(exports$B, "__esModule", {
  value: true
});
exports$B.ProxyTracer = void 0;
const NoopTracer_1 = __require$x ?? _default_default$x ?? _mod$e;
const NOOP_TRACER = new NoopTracer_1.NoopTracer();
class ProxyTracer {
  constructor(provider, name, version2, options2) {
    this._provider = provider;
    this.name = name;
    this.version = version2;
    this.options = options2;
  }
  startSpan(name, options2, context) {
    return this._getTracer().startSpan(name, options2, context);
  }
  startActiveSpan(_name, _options, _context2, _fn) {
    const tracer2 = this._getTracer();
    return Reflect.apply(tracer2.startActiveSpan, tracer2, arguments);
  }
  /**
   * Try to get a tracer from the proxy tracer provider.
   * If the proxy tracer provider has no delegate, return a noop tracer.
   */
  _getTracer() {
    if (this._delegate) {
      return this._delegate;
    }
    const tracer2 = this._provider.getDelegateTracer(this.name, this.version, this.options);
    if (!tracer2) {
      return NOOP_TRACER;
    }
    this._delegate = tracer2;
    return this._delegate;
  }
}
exports$B.ProxyTracer = ProxyTracer;
var _ProxyTracer = exports$B.ProxyTracer;
var _default$w;
if (typeof exports$B === "object" && exports$B !== null && "default" in exports$B) {
  _default$w = exports$B.default;
} else {
  _default$w = exports$B;
}
const _default_default$v = _default$w;
var __require$v = exports$B;
exports$B.__esModule;
const _mod8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ProxyTracer: _ProxyTracer,
  __require: __require$v,
  default: _default_default$v
}, Symbol.toStringTag, { value: "Module" }));
var exports$A = {};
Object.defineProperty(exports$A, "__esModule", {
  value: true
});
Object.defineProperty(exports$A, "__esModule", {
  value: true
});
exports$A.ProxyTracerProvider = void 0;
const ProxyTracer_1$1 = __require$v ?? _default_default$v ?? _mod8;
const NoopTracerProvider_1 = __require$w ?? _default_default$w ?? _mod2$3;
const NOOP_TRACER_PROVIDER = new NoopTracerProvider_1.NoopTracerProvider();
class ProxyTracerProvider {
  /**
   * Get a {@link ProxyTracer}
   */
  getTracer(name, version2, options2) {
    var _a;
    return (_a = this.getDelegateTracer(name, version2, options2)) !== null && _a !== void 0 ? _a : new ProxyTracer_1$1.ProxyTracer(this, name, version2, options2);
  }
  getDelegate() {
    var _a;
    return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
  }
  /**
   * Set the delegate tracer provider
   */
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  getDelegateTracer(name, version2, options2) {
    var _a;
    return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version2, options2);
  }
}
exports$A.ProxyTracerProvider = ProxyTracerProvider;
var _ProxyTracerProvider = exports$A.ProxyTracerProvider;
var _default$v;
if (typeof exports$A === "object" && exports$A !== null && "default" in exports$A) {
  _default$v = exports$A.default;
} else {
  _default$v = exports$A;
}
const _default_default$u = _default$v;
var __require$u = exports$A;
exports$A.__esModule;
const _mod9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ProxyTracerProvider: _ProxyTracerProvider,
  __require: __require$u,
  default: _default_default$u
}, Symbol.toStringTag, { value: "Module" }));
var exports$z = {};
Object.defineProperty(exports$z, "__esModule", {
  value: true
});
Object.defineProperty(exports$z, "__esModule", {
  value: true
});
exports$z.TraceAPI = void 0;
const global_utils_1$2 = __require$K ?? _default_default$K ?? _mod2$6;
const ProxyTracerProvider_1$1 = __require$u ?? _default_default$u ?? _mod9;
const spancontext_utils_1$1 = __require$y ?? _default_default$y ?? _mod13;
const context_utils_1 = __require$z ?? _default_default$z ?? _mod4$1;
const diag_1$4 = __require$G ?? _default_default$G ?? _mod$h;
const API_NAME$2 = "trace";
class TraceAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
    this.wrapSpanContext = spancontext_utils_1$1.wrapSpanContext;
    this.isSpanContextValid = spancontext_utils_1$1.isSpanContextValid;
    this.deleteSpan = context_utils_1.deleteSpan;
    this.getSpan = context_utils_1.getSpan;
    this.getActiveSpan = context_utils_1.getActiveSpan;
    this.getSpanContext = context_utils_1.getSpanContext;
    this.setSpan = context_utils_1.setSpan;
    this.setSpanContext = context_utils_1.setSpanContext;
  }
  /** Get the singleton instance of the Trace API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new TraceAPI();
    }
    return this._instance;
  }
  /**
   * Set the current global tracer.
   *
   * @returns true if the tracer provider was successfully registered, else false
   */
  setGlobalTracerProvider(provider) {
    const success = (0, global_utils_1$2.registerGlobal)(API_NAME$2, this._proxyTracerProvider, diag_1$4.DiagAPI.instance());
    if (success) {
      this._proxyTracerProvider.setDelegate(provider);
    }
    return success;
  }
  /**
   * Returns the global tracer provider.
   */
  getTracerProvider() {
    return (0, global_utils_1$2.getGlobal)(API_NAME$2) || this._proxyTracerProvider;
  }
  /**
   * Returns a tracer from the global tracer provider.
   */
  getTracer(name, version2) {
    return this.getTracerProvider().getTracer(name, version2);
  }
  /** Remove the global tracer provider */
  disable() {
    (0, global_utils_1$2.unregisterGlobal)(API_NAME$2, diag_1$4.DiagAPI.instance());
    this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
  }
}
exports$z.TraceAPI = TraceAPI;
var _TraceAPI = exports$z.TraceAPI;
var _default$u;
if (typeof exports$z === "object" && exports$z !== null && "default" in exports$z) {
  _default$u = exports$z.default;
} else {
  _default$u = exports$z;
}
const _default_default$t = _default$u;
var __require$t = exports$z;
exports$z.__esModule;
const _mod$d = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceAPI: _TraceAPI,
  __require: __require$t,
  default: _default_default$t
}, Symbol.toStringTag, { value: "Module" }));
var exports$y = {};
Object.defineProperty(exports$y, "__esModule", {
  value: true
});
Object.defineProperty(exports$y, "__esModule", {
  value: true
});
exports$y.trace = void 0;
const trace_1 = __require$t ?? _default_default$t ?? _mod$d;
exports$y.trace = trace_1.TraceAPI.getInstance();
var _trace$1 = exports$y.trace;
var _default$t;
if (typeof exports$y === "object" && exports$y !== null && "default" in exports$y) {
  _default$t = exports$y.default;
} else {
  _default$t = exports$y;
}
const _default_default$s = _default$t;
var __require$s = exports$y;
exports$y.__esModule;
const _mod19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$s,
  default: _default_default$s,
  trace: _trace$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$x = {};
Object.defineProperty(exports$x, "__esModule", {
  value: true
});
Object.defineProperty(exports$x, "__esModule", {
  value: true
});
exports$x.baggageEntryMetadataSymbol = void 0;
exports$x.baggageEntryMetadataSymbol = /* @__PURE__ */ Symbol("BaggageEntryMetadata");
var _baggageEntryMetadataSymbol = exports$x.baggageEntryMetadataSymbol;
var _default$s;
if (typeof exports$x === "object" && exports$x !== null && "default" in exports$x) {
  _default$s = exports$x.default;
} else {
  _default$s = exports$x;
}
const _default_default$r = _default$s;
var __require$r = exports$x;
exports$x.__esModule;
const _mod3$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$r,
  baggageEntryMetadataSymbol: _baggageEntryMetadataSymbol,
  default: _default_default$r
}, Symbol.toStringTag, { value: "Module" }));
var exports$w = {};
Object.defineProperty(exports$w, "__esModule", {
  value: true
});
Object.defineProperty(exports$w, "__esModule", {
  value: true
});
exports$w.BaggageImpl = void 0;
class BaggageImpl {
  constructor(entries) {
    this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
  }
  getEntry(key) {
    const entry = this._entries.get(key);
    if (!entry) {
      return void 0;
    }
    return Object.assign({}, entry);
  }
  getAllEntries() {
    return Array.from(this._entries.entries());
  }
  setEntry(key, entry) {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.set(key, entry);
    return newBaggage;
  }
  removeEntry(key) {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.delete(key);
    return newBaggage;
  }
  removeEntries(...keys) {
    const newBaggage = new BaggageImpl(this._entries);
    for (const key of keys) {
      newBaggage._entries.delete(key);
    }
    return newBaggage;
  }
  clear() {
    return new BaggageImpl();
  }
}
exports$w.BaggageImpl = BaggageImpl;
var _BaggageImpl = exports$w.BaggageImpl;
var _default$r;
if (typeof exports$w === "object" && exports$w !== null && "default" in exports$w) {
  _default$r = exports$w.default;
} else {
  _default$r = exports$w;
}
const _default_default$q = _default$r;
var __require$q = exports$w;
exports$w.__esModule;
const _mod2$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaggageImpl: _BaggageImpl,
  __require: __require$q,
  default: _default_default$q
}, Symbol.toStringTag, { value: "Module" }));
var exports$v = {};
Object.defineProperty(exports$v, "__esModule", {
  value: true
});
Object.defineProperty(exports$v, "__esModule", {
  value: true
});
const diag_1$3 = __require$G ?? _default_default$G ?? _mod$h;
const baggage_impl_1 = __require$q ?? _default_default$q ?? _mod2$2;
const symbol_1 = __require$r ?? _default_default$r ?? _mod3$1;
const diag = diag_1$3.DiagAPI.instance();
function createBaggage(entries = {}) {
  return new baggage_impl_1.BaggageImpl(new Map(Object.entries(entries)));
}
exports$v.createBaggage = createBaggage;
function baggageEntryMetadataFromString(str) {
  if (typeof str !== "string") {
    diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
    str = "";
  }
  return {
    __TYPE__: symbol_1.baggageEntryMetadataSymbol,
    toString() {
      return str;
    }
  };
}
exports$v.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
var _createBaggage = exports$v.createBaggage;
var _baggageEntryMetadataFromString = exports$v.baggageEntryMetadataFromString;
var _default$q;
if (typeof exports$v === "object" && exports$v !== null && "default" in exports$v) {
  _default$q = exports$v.default;
} else {
  _default$q = exports$v;
}
const _default_default$p = _default$q;
var __require$p = exports$v;
exports$v.__esModule;
const _mod$c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$p,
  baggageEntryMetadataFromString: _baggageEntryMetadataFromString,
  createBaggage: _createBaggage,
  default: _default_default$p
}, Symbol.toStringTag, { value: "Module" }));
var exports$u = {};
Object.defineProperty(exports$u, "__esModule", {
  value: true
});
Object.defineProperty(exports$u, "__esModule", {
  value: true
});
const context_1$2 = __require$D ?? _default_default$D ?? _mod$f;
const context_2 = __require$F ?? _default_default$F ?? _mod2$4;
const BAGGAGE_KEY = (0, context_2.createContextKey)("OpenTelemetry Baggage Key");
function getBaggage(context) {
  return context.getValue(BAGGAGE_KEY) || void 0;
}
exports$u.getBaggage = getBaggage;
function getActiveBaggage() {
  return getBaggage(context_1$2.ContextAPI.getInstance().active());
}
exports$u.getActiveBaggage = getActiveBaggage;
function setBaggage(context, baggage) {
  return context.setValue(BAGGAGE_KEY, baggage);
}
exports$u.setBaggage = setBaggage;
function deleteBaggage(context) {
  return context.deleteValue(BAGGAGE_KEY);
}
exports$u.deleteBaggage = deleteBaggage;
var _getBaggage = exports$u.getBaggage;
var _getActiveBaggage = exports$u.getActiveBaggage;
var _setBaggage = exports$u.setBaggage;
var _deleteBaggage = exports$u.deleteBaggage;
var _default$p;
if (typeof exports$u === "object" && exports$u !== null && "default" in exports$u) {
  _default$p = exports$u.default;
} else {
  _default$p = exports$u;
}
const _default_default$o = _default$p;
var __require$o = exports$u;
exports$u.__esModule;
const _mod4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$o,
  default: _default_default$o,
  deleteBaggage: _deleteBaggage,
  getActiveBaggage: _getActiveBaggage,
  getBaggage: _getBaggage,
  setBaggage: _setBaggage
}, Symbol.toStringTag, { value: "Module" }));
var exports$t = {};
Object.defineProperty(exports$t, "__esModule", {
  value: true
});
Object.defineProperty(exports$t, "__esModule", {
  value: true
});
exports$t.defaultTextMapGetter = {
  get(carrier, key) {
    if (carrier == null) {
      return void 0;
    }
    return carrier[key];
  },
  keys(carrier) {
    if (carrier == null) {
      return [];
    }
    return Object.keys(carrier);
  }
};
exports$t.defaultTextMapSetter = {
  set(carrier, key, value) {
    if (carrier == null) {
      return;
    }
    carrier[key] = value;
  }
};
var _defaultTextMapGetter = exports$t.defaultTextMapGetter;
var _defaultTextMapSetter = exports$t.defaultTextMapSetter;
var _default$o;
if (typeof exports$t === "object" && exports$t !== null && "default" in exports$t) {
  _default$o = exports$t.default;
} else {
  _default$o = exports$t;
}
const _default_default$n = _default$o;
var __require$n = exports$t;
exports$t.__esModule;
const _mod7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$n,
  default: _default_default$n,
  defaultTextMapGetter: _defaultTextMapGetter,
  defaultTextMapSetter: _defaultTextMapSetter
}, Symbol.toStringTag, { value: "Module" }));
var exports$s = {};
Object.defineProperty(exports$s, "__esModule", {
  value: true
});
Object.defineProperty(exports$s, "__esModule", {
  value: true
});
exports$s.NoopTextMapPropagator = void 0;
class NoopTextMapPropagator {
  /** Noop inject function does nothing */
  inject(_context2, _carrier) {
  }
  /** Noop extract function does nothing and returns the input context */
  extract(context, _carrier) {
    return context;
  }
  fields() {
    return [];
  }
}
exports$s.NoopTextMapPropagator = NoopTextMapPropagator;
var _NoopTextMapPropagator = exports$s.NoopTextMapPropagator;
var _default$n;
if (typeof exports$s === "object" && exports$s !== null && "default" in exports$s) {
  _default$n = exports$s.default;
} else {
  _default$n = exports$s;
}
const _default_default$m = _default$n;
var __require$m = exports$s;
exports$s.__esModule;
const _mod2$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTextMapPropagator: _NoopTextMapPropagator,
  __require: __require$m,
  default: _default_default$m
}, Symbol.toStringTag, { value: "Module" }));
var exports$r = {};
Object.defineProperty(exports$r, "__esModule", {
  value: true
});
Object.defineProperty(exports$r, "__esModule", {
  value: true
});
exports$r.PropagationAPI = void 0;
const global_utils_1$1 = __require$K ?? _default_default$K ?? _mod2$6;
const NoopTextMapPropagator_1 = __require$m ?? _default_default$m ?? _mod2$1;
const TextMapPropagator_1$1 = __require$n ?? _default_default$n ?? _mod7;
const context_helpers_1 = __require$o ?? _default_default$o ?? _mod4;
const utils_1$1 = __require$p ?? _default_default$p ?? _mod$c;
const diag_1$2 = __require$G ?? _default_default$G ?? _mod$h;
const API_NAME$1 = "propagation";
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator_1.NoopTextMapPropagator();
class PropagationAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this.createBaggage = utils_1$1.createBaggage;
    this.getBaggage = context_helpers_1.getBaggage;
    this.getActiveBaggage = context_helpers_1.getActiveBaggage;
    this.setBaggage = context_helpers_1.setBaggage;
    this.deleteBaggage = context_helpers_1.deleteBaggage;
  }
  /** Get the singleton instance of the Propagator API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new PropagationAPI();
    }
    return this._instance;
  }
  /**
   * Set the current propagator.
   *
   * @returns true if the propagator was successfully registered, else false
   */
  setGlobalPropagator(propagator) {
    return (0, global_utils_1$1.registerGlobal)(API_NAME$1, propagator, diag_1$2.DiagAPI.instance());
  }
  /**
   * Inject context into a carrier to be propagated inter-process
   *
   * @param context Context carrying tracing data to inject
   * @param carrier carrier to inject context into
   * @param setter Function used to set values on the carrier
   */
  inject(context, carrier, setter = TextMapPropagator_1$1.defaultTextMapSetter) {
    return this._getGlobalPropagator().inject(context, carrier, setter);
  }
  /**
   * Extract context from a carrier
   *
   * @param context Context which the newly created context will inherit from
   * @param carrier Carrier to extract context from
   * @param getter Function used to extract keys from a carrier
   */
  extract(context, carrier, getter = TextMapPropagator_1$1.defaultTextMapGetter) {
    return this._getGlobalPropagator().extract(context, carrier, getter);
  }
  /**
   * Return a list of all fields which may be used by the propagator.
   */
  fields() {
    return this._getGlobalPropagator().fields();
  }
  /** Remove the global propagator */
  disable() {
    (0, global_utils_1$1.unregisterGlobal)(API_NAME$1, diag_1$2.DiagAPI.instance());
  }
  _getGlobalPropagator() {
    return (0, global_utils_1$1.getGlobal)(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
  }
}
exports$r.PropagationAPI = PropagationAPI;
var _PropagationAPI = exports$r.PropagationAPI;
var _default$m;
if (typeof exports$r === "object" && exports$r !== null && "default" in exports$r) {
  _default$m = exports$r.default;
} else {
  _default$m = exports$r;
}
const _default_default$l = _default$m;
var __require$l = exports$r;
exports$r.__esModule;
const _mod$b = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PropagationAPI: _PropagationAPI,
  __require: __require$l,
  default: _default_default$l
}, Symbol.toStringTag, { value: "Module" }));
var exports$q = {};
Object.defineProperty(exports$q, "__esModule", {
  value: true
});
Object.defineProperty(exports$q, "__esModule", {
  value: true
});
exports$q.propagation = void 0;
const propagation_1 = __require$l ?? _default_default$l ?? _mod$b;
exports$q.propagation = propagation_1.PropagationAPI.getInstance();
var _propagation = exports$q.propagation;
var _default$l;
if (typeof exports$q === "object" && exports$q !== null && "default" in exports$q) {
  _default$l = exports$q.default;
} else {
  _default$l = exports$q;
}
const _default_default$k = _default$l;
var __require$k = exports$q;
exports$q.__esModule;
const _mod18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$k,
  default: _default_default$k,
  propagation: _propagation
}, Symbol.toStringTag, { value: "Module" }));
var exports$p = {};
Object.defineProperty(exports$p, "__esModule", {
  value: true
});
Object.defineProperty(exports$p, "__esModule", {
  value: true
});
class NoopMeter {
  constructor() {
  }
  /**
   * @see {@link Meter.createGauge}
   */
  createGauge(_name, _options) {
    return exports$p.NOOP_GAUGE_METRIC;
  }
  /**
   * @see {@link Meter.createHistogram}
   */
  createHistogram(_name, _options) {
    return exports$p.NOOP_HISTOGRAM_METRIC;
  }
  /**
   * @see {@link Meter.createCounter}
   */
  createCounter(_name, _options) {
    return exports$p.NOOP_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createUpDownCounter(_name, _options) {
    return exports$p.NOOP_UP_DOWN_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.createObservableGauge}
   */
  createObservableGauge(_name, _options) {
    return exports$p.NOOP_OBSERVABLE_GAUGE_METRIC;
  }
  /**
   * @see {@link Meter.createObservableCounter}
   */
  createObservableCounter(_name, _options) {
    return exports$p.NOOP_OBSERVABLE_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.createObservableUpDownCounter}
   */
  createObservableUpDownCounter(_name, _options) {
    return exports$p.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.addBatchObservableCallback}
   */
  addBatchObservableCallback(_callback, _observables) {
  }
  /**
   * @see {@link Meter.removeBatchObservableCallback}
   */
  removeBatchObservableCallback(_callback) {
  }
}
exports$p.NoopMeter = NoopMeter;
class NoopMetric {
}
exports$p.NoopMetric = NoopMetric;
class NoopCounterMetric extends NoopMetric {
  add(_value, _attributes) {
  }
}
exports$p.NoopCounterMetric = NoopCounterMetric;
class NoopUpDownCounterMetric extends NoopMetric {
  add(_value, _attributes) {
  }
}
exports$p.NoopUpDownCounterMetric = NoopUpDownCounterMetric;
class NoopGaugeMetric extends NoopMetric {
  record(_value, _attributes) {
  }
}
exports$p.NoopGaugeMetric = NoopGaugeMetric;
class NoopHistogramMetric extends NoopMetric {
  record(_value, _attributes) {
  }
}
exports$p.NoopHistogramMetric = NoopHistogramMetric;
class NoopObservableMetric {
  addCallback(_callback) {
  }
  removeCallback(_callback) {
  }
}
exports$p.NoopObservableMetric = NoopObservableMetric;
class NoopObservableCounterMetric extends NoopObservableMetric {
}
exports$p.NoopObservableCounterMetric = NoopObservableCounterMetric;
class NoopObservableGaugeMetric extends NoopObservableMetric {
}
exports$p.NoopObservableGaugeMetric = NoopObservableGaugeMetric;
class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
}
exports$p.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
exports$p.NOOP_METER = new NoopMeter();
exports$p.NOOP_COUNTER_METRIC = new NoopCounterMetric();
exports$p.NOOP_GAUGE_METRIC = new NoopGaugeMetric();
exports$p.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
exports$p.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
exports$p.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
exports$p.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
exports$p.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
function createNoopMeter() {
  return exports$p.NOOP_METER;
}
exports$p.createNoopMeter = createNoopMeter;
exports$p.NOOP_GAUGE_METRIC;
exports$p.NOOP_HISTOGRAM_METRIC;
exports$p.NOOP_COUNTER_METRIC;
exports$p.NOOP_UP_DOWN_COUNTER_METRIC;
exports$p.NOOP_OBSERVABLE_GAUGE_METRIC;
exports$p.NOOP_OBSERVABLE_COUNTER_METRIC;
exports$p.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
exports$p.NoopMeter;
exports$p.NoopMetric;
exports$p.NoopCounterMetric;
exports$p.NoopUpDownCounterMetric;
exports$p.NoopGaugeMetric;
exports$p.NoopHistogramMetric;
exports$p.NoopObservableMetric;
exports$p.NoopObservableCounterMetric;
exports$p.NoopObservableGaugeMetric;
exports$p.NoopObservableUpDownCounterMetric;
var _NOOP_METER = exports$p.NOOP_METER;
var _createNoopMeter = exports$p.createNoopMeter;
var _default$k;
if (typeof exports$p === "object" && exports$p !== null && "default" in exports$p) {
  _default$k = exports$p.default;
} else {
  _default$k = exports$p;
}
const _default_default$j = _default$k;
var __require$j = exports$p;
exports$p.__esModule;
const _mod5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NOOP_METER: _NOOP_METER,
  __require: __require$j,
  createNoopMeter: _createNoopMeter,
  default: _default_default$j
}, Symbol.toStringTag, { value: "Module" }));
var exports$o = {};
Object.defineProperty(exports$o, "__esModule", {
  value: true
});
Object.defineProperty(exports$o, "__esModule", {
  value: true
});
const NoopMeter_1$1 = __require$j ?? _default_default$j ?? _mod5;
class NoopMeterProvider {
  getMeter(_name, _version, _options) {
    return NoopMeter_1$1.NOOP_METER;
  }
}
exports$o.NoopMeterProvider = NoopMeterProvider;
exports$o.NOOP_METER_PROVIDER = new NoopMeterProvider();
exports$o.NoopMeterProvider;
var _NOOP_METER_PROVIDER = exports$o.NOOP_METER_PROVIDER;
var _default$j;
if (typeof exports$o === "object" && exports$o !== null && "default" in exports$o) {
  _default$j = exports$o.default;
} else {
  _default$j = exports$o;
}
const _default_default$i = _default$j;
var __require$i = exports$o;
exports$o.__esModule;
const _mod$a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NOOP_METER_PROVIDER: _NOOP_METER_PROVIDER,
  __require: __require$i,
  default: _default_default$i
}, Symbol.toStringTag, { value: "Module" }));
var exports$n = {};
Object.defineProperty(exports$n, "__esModule", {
  value: true
});
Object.defineProperty(exports$n, "__esModule", {
  value: true
});
exports$n.MetricsAPI = void 0;
const NoopMeterProvider_1 = __require$i ?? _default_default$i ?? _mod$a;
const global_utils_1 = __require$K ?? _default_default$K ?? _mod2$6;
const diag_1$1 = __require$G ?? _default_default$G ?? _mod$h;
const API_NAME = "metrics";
class MetricsAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Metrics API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new MetricsAPI();
    }
    return this._instance;
  }
  /**
   * Set the current global meter provider.
   * Returns true if the meter provider was successfully registered, else false.
   */
  setGlobalMeterProvider(provider) {
    return (0, global_utils_1.registerGlobal)(API_NAME, provider, diag_1$1.DiagAPI.instance());
  }
  /**
   * Returns the global meter provider.
   */
  getMeterProvider() {
    return (0, global_utils_1.getGlobal)(API_NAME) || NoopMeterProvider_1.NOOP_METER_PROVIDER;
  }
  /**
   * Returns a meter from the global meter provider.
   */
  getMeter(name, version2, options2) {
    return this.getMeterProvider().getMeter(name, version2, options2);
  }
  /** Remove the global meter provider */
  disable() {
    (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1$1.DiagAPI.instance());
  }
}
exports$n.MetricsAPI = MetricsAPI;
var _MetricsAPI = exports$n.MetricsAPI;
var _default$i;
if (typeof exports$n === "object" && exports$n !== null && "default" in exports$n) {
  _default$i = exports$n.default;
} else {
  _default$i = exports$n;
}
const _default_default$h = _default$i;
var __require$h = exports$n;
exports$n.__esModule;
const _mod$9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MetricsAPI: _MetricsAPI,
  __require: __require$h,
  default: _default_default$h
}, Symbol.toStringTag, { value: "Module" }));
var exports$m = {};
Object.defineProperty(exports$m, "__esModule", {
  value: true
});
Object.defineProperty(exports$m, "__esModule", {
  value: true
});
exports$m.metrics = void 0;
const metrics_1 = __require$h ?? _default_default$h ?? _mod$9;
exports$m.metrics = metrics_1.MetricsAPI.getInstance();
var _metrics = exports$m.metrics;
var _default$h;
if (typeof exports$m === "object" && exports$m !== null && "default" in exports$m) {
  _default$h = exports$m.default;
} else {
  _default$h = exports$m;
}
const _default_default$g = _default$h;
var __require$g = exports$m;
exports$m.__esModule;
const _mod17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$g,
  default: _default_default$g,
  metrics: _metrics
}, Symbol.toStringTag, { value: "Module" }));
var exports$l = {};
Object.defineProperty(exports$l, "__esModule", {
  value: true
});
Object.defineProperty(exports$l, "__esModule", {
  value: true
});
exports$l.diag = void 0;
const diag_1 = __require$G ?? _default_default$G ?? _mod$h;
exports$l.diag = diag_1.DiagAPI.instance();
var _diag = exports$l.diag;
var _default$g;
if (typeof exports$l === "object" && exports$l !== null && "default" in exports$l) {
  _default$g = exports$l.default;
} else {
  _default$g = exports$l;
}
const _default_default$f = _default$g;
var __require$f = exports$l;
exports$l.__esModule;
const _mod16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$f,
  default: _default_default$f,
  diag: _diag
}, Symbol.toStringTag, { value: "Module" }));
var exports$k = {};
Object.defineProperty(exports$k, "__esModule", {
  value: true
});
Object.defineProperty(exports$k, "__esModule", {
  value: true
});
exports$k.context = void 0;
const context_1$1 = __require$D ?? _default_default$D ?? _mod$f;
exports$k.context = context_1$1.ContextAPI.getInstance();
var _context = exports$k.context;
var _default$f;
if (typeof exports$k === "object" && exports$k !== null && "default" in exports$k) {
  _default$f = exports$k.default;
} else {
  _default$f = exports$k;
}
const _default_default$e = _default$f;
var __require$e = exports$k;
exports$k.__esModule;
const _mod15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$e,
  context: _context,
  default: _default_default$e
}, Symbol.toStringTag, { value: "Module" }));
var exports$j = {};
Object.defineProperty(exports$j, "__esModule", {
  value: true
});
Object.defineProperty(exports$j, "__esModule", {
  value: true
});
const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
function validateKey(key) {
  return VALID_KEY_REGEX.test(key);
}
exports$j.validateKey = validateKey;
function validateValue(value) {
  return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
exports$j.validateValue = validateValue;
var _validateKey = exports$j.validateKey;
var _validateValue = exports$j.validateValue;
var _default$e;
if (typeof exports$j === "object" && exports$j !== null && "default" in exports$j) {
  _default$e = exports$j.default;
} else {
  _default$e = exports$j;
}
const _default_default$d = _default$e;
var __require$d = exports$j;
exports$j.__esModule;
const _mod$8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$d,
  default: _default_default$d,
  validateKey: _validateKey,
  validateValue: _validateValue
}, Symbol.toStringTag, { value: "Module" }));
var exports$i = {};
Object.defineProperty(exports$i, "__esModule", {
  value: true
});
Object.defineProperty(exports$i, "__esModule", {
  value: true
});
exports$i.TraceStateImpl = void 0;
const tracestate_validators_1 = __require$d ?? _default_default$d ?? _mod$8;
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
class TraceStateImpl {
  constructor(rawTraceState) {
    this._internalState = /* @__PURE__ */ new Map();
    if (rawTraceState) this._parse(rawTraceState);
  }
  set(key, value) {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }
  unset(key) {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }
  get(key) {
    return this._internalState.get(key);
  }
  serialize() {
    return Array.from(this._internalState.keys()).reduceRight((agg, key) => {
      agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
      return agg;
    }, []).join(LIST_MEMBERS_SEPARATOR);
  }
  _parse(rawTraceState) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
    this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reduceRight((agg, part) => {
      const listMember = part.trim();
      const i2 = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (i2 !== -1) {
        const key = listMember.slice(0, i2);
        const value = listMember.slice(i2 + 1, part.length);
        if ((0, tracestate_validators_1.validateKey)(key) && (0, tracestate_validators_1.validateValue)(value)) {
          agg.set(key, value);
        }
      }
      return agg;
    }, /* @__PURE__ */ new Map());
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
    }
  }
  // @ts-expect-error TS6133 Accessed in tests only.
  _keys() {
    return Array.from(this._internalState.keys()).reverse();
  }
  _clone() {
    const traceState = new TraceStateImpl();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
exports$i.TraceStateImpl = TraceStateImpl;
var _TraceStateImpl = exports$i.TraceStateImpl;
var _default$d;
if (typeof exports$i === "object" && exports$i !== null && "default" in exports$i) {
  _default$d = exports$i.default;
} else {
  _default$d = exports$i;
}
const _default_default$c = _default$d;
var __require$c = exports$i;
exports$i.__esModule;
const _mod$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceStateImpl: _TraceStateImpl,
  __require: __require$c,
  default: _default_default$c
}, Symbol.toStringTag, { value: "Module" }));
var exports$h = {};
Object.defineProperty(exports$h, "__esModule", {
  value: true
});
Object.defineProperty(exports$h, "__esModule", {
  value: true
});
exports$h.createTraceState = void 0;
const tracestate_impl_1 = __require$c ?? _default_default$c ?? _mod$7;
function createTraceState(rawTraceState) {
  return new tracestate_impl_1.TraceStateImpl(rawTraceState);
}
exports$h.createTraceState = createTraceState;
var _createTraceState = exports$h.createTraceState;
var _default$c;
if (typeof exports$h === "object" && exports$h !== null && "default" in exports$h) {
  _default$c = exports$h.default;
} else {
  _default$c = exports$h;
}
const _default_default$b = _default$c;
var __require$b = exports$h;
exports$h.__esModule;
const _mod12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$b,
  createTraceState: _createTraceState,
  default: _default_default$b
}, Symbol.toStringTag, { value: "Module" }));
var exports$g = {};
Object.defineProperty(exports$g, "__esModule", {
  value: true
});
Object.defineProperty(exports$g, "__esModule", {
  value: true
});
exports$g.SpanStatusCode = void 0;
(function(SpanStatusCode) {
  SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
  SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
  SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
})(exports$g.SpanStatusCode || (exports$g.SpanStatusCode = {}));
var _SpanStatusCode$1 = exports$g.SpanStatusCode;
var _default$b;
if (typeof exports$g === "object" && exports$g !== null && "default" in exports$g) {
  _default$b = exports$g.default;
} else {
  _default$b = exports$g;
}
const _default_default$a = _default$b;
var __require$a = exports$g;
exports$g.__esModule;
const _mod10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SpanStatusCode: _SpanStatusCode$1,
  __require: __require$a,
  default: _default_default$a
}, Symbol.toStringTag, { value: "Module" }));
var exports$f = {};
Object.defineProperty(exports$f, "__esModule", {
  value: true
});
Object.defineProperty(exports$f, "__esModule", {
  value: true
});
exports$f.SpanKind = void 0;
(function(SpanKind) {
  SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
  SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
  SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
  SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
  SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(exports$f.SpanKind || (exports$f.SpanKind = {}));
var _SpanKind = exports$f.SpanKind;
var _default$a;
if (typeof exports$f === "object" && exports$f !== null && "default" in exports$f) {
  _default$a = exports$f.default;
} else {
  _default$a = exports$f;
}
const _default_default$9 = _default$a;
var __require$9 = exports$f;
exports$f.__esModule;
const _mod1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SpanKind: _SpanKind,
  __require: __require$9,
  default: _default_default$9
}, Symbol.toStringTag, { value: "Module" }));
var exports$e = {};
Object.defineProperty(exports$e, "__esModule", {
  value: true
});
Object.defineProperty(exports$e, "__esModule", {
  value: true
});
exports$e.SamplingDecision = void 0;
(function(SamplingDecision) {
  SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
  SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
  SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(exports$e.SamplingDecision || (exports$e.SamplingDecision = {}));
var _SamplingDecision = exports$e.SamplingDecision;
var _default$9;
if (typeof exports$e === "object" && exports$e !== null && "default" in exports$e) {
  _default$9 = exports$e.default;
} else {
  _default$9 = exports$e;
}
const _default_default$8 = _default$9;
var __require$8 = exports$e;
exports$e.__esModule;
const _mod0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SamplingDecision: _SamplingDecision,
  __require: __require$8,
  default: _default_default$8
}, Symbol.toStringTag, { value: "Module" }));
var exports$d = {};
Object.defineProperty(exports$d, "__esModule", {
  value: true
});
Object.defineProperty(exports$d, "__esModule", {
  value: true
});
exports$d.ValueType = void 0;
(function(ValueType) {
  ValueType[ValueType["INT"] = 0] = "INT";
  ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(exports$d.ValueType || (exports$d.ValueType = {}));
var _ValueType = exports$d.ValueType;
var _default$8;
if (typeof exports$d === "object" && exports$d !== null && "default" in exports$d) {
  _default$8 = exports$d.default;
} else {
  _default$8 = exports$d;
}
const _default_default$7 = _default$8;
var __require$7 = exports$d;
exports$d.__esModule;
const _mod6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ValueType: _ValueType,
  __require: __require$7,
  default: _default_default$7
}, Symbol.toStringTag, { value: "Module" }));
var exports$c = {};
Object.defineProperty(exports$c, "__esModule", {
  value: true
});
Object.defineProperty(exports$c, "__esModule", {
  value: true
});
const consoleMap = [{
  n: "error",
  c: "error"
}, {
  n: "warn",
  c: "warn"
}, {
  n: "info",
  c: "info"
}, {
  n: "debug",
  c: "debug"
}, {
  n: "verbose",
  c: "trace"
}];
exports$c._originalConsoleMethods = {};
if (typeof console !== "undefined") {
  const keys = ["error", "warn", "info", "debug", "trace", "log"];
  for (const key of keys) {
    if (typeof console[key] === "function") {
      exports$c._originalConsoleMethods[key] = console[key];
    }
  }
}
class DiagConsoleLogger {
  constructor() {
    function _consoleFunc(funcName) {
      return function(...args) {
        let theFunc = exports$c._originalConsoleMethods[funcName];
        if (typeof theFunc !== "function") {
          theFunc = exports$c._originalConsoleMethods["log"];
        }
        if (typeof theFunc !== "function" && console) {
          theFunc = console[funcName];
          if (typeof theFunc !== "function") {
            theFunc = console.log;
          }
        }
        if (typeof theFunc === "function") {
          return theFunc.apply(console, args);
        }
      };
    }
    for (let i2 = 0; i2 < consoleMap.length; i2++) {
      this[consoleMap[i2].n] = _consoleFunc(consoleMap[i2].c);
    }
  }
}
exports$c.DiagConsoleLogger = DiagConsoleLogger;
exports$c._originalConsoleMethods;
var _DiagConsoleLogger = exports$c.DiagConsoleLogger;
var _default$7;
if (typeof exports$c === "object" && exports$c !== null && "default" in exports$c) {
  _default$7 = exports$c.default;
} else {
  _default$7 = exports$c;
}
const _default_default$6 = _default$7;
var __require$6 = exports$c;
exports$c.__esModule;
const _mod3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagConsoleLogger: _DiagConsoleLogger,
  __require: __require$6,
  default: _default_default$6
}, Symbol.toStringTag, { value: "Module" }));
var exports$b = {};
Object.defineProperty(exports$b, "__esModule", {
  value: true
});
Object.defineProperty(exports$b, "__esModule", {
  value: true
});
var utils_1 = __require$p ?? _default_default$p ?? _mod$c;
exports$b.baggageEntryMetadataFromString = utils_1.baggageEntryMetadataFromString;
var context_1 = __require$F ?? _default_default$F ?? _mod2$4;
exports$b.createContextKey = context_1.createContextKey;
exports$b.ROOT_CONTEXT = context_1.ROOT_CONTEXT;
var consoleLogger_1 = __require$6 ?? _default_default$6 ?? _mod3;
exports$b.DiagConsoleLogger = consoleLogger_1.DiagConsoleLogger;
var types_1 = __require$J ?? _default_default$J ?? _mod4$2;
exports$b.DiagLogLevel = types_1.DiagLogLevel;
var NoopMeter_1 = __require$j ?? _default_default$j ?? _mod5;
exports$b.createNoopMeter = NoopMeter_1.createNoopMeter;
var Metric_1 = __require$7 ?? _default_default$7 ?? _mod6;
exports$b.ValueType = Metric_1.ValueType;
var TextMapPropagator_1 = __require$n ?? _default_default$n ?? _mod7;
exports$b.defaultTextMapGetter = TextMapPropagator_1.defaultTextMapGetter;
exports$b.defaultTextMapSetter = TextMapPropagator_1.defaultTextMapSetter;
var ProxyTracer_1 = __require$v ?? _default_default$v ?? _mod8;
exports$b.ProxyTracer = ProxyTracer_1.ProxyTracer;
var ProxyTracerProvider_1 = __require$u ?? _default_default$u ?? _mod9;
exports$b.ProxyTracerProvider = ProxyTracerProvider_1.ProxyTracerProvider;
var SamplingResult_1 = __require$8 ?? _default_default$8 ?? _mod0;
exports$b.SamplingDecision = SamplingResult_1.SamplingDecision;
var span_kind_1 = __require$9 ?? _default_default$9 ?? _mod1;
exports$b.SpanKind = span_kind_1.SpanKind;
var status_1 = __require$a ?? _default_default$a ?? _mod10;
exports$b.SpanStatusCode = status_1.SpanStatusCode;
var trace_flags_1 = __require$C ?? _default_default$C ?? _mod11;
exports$b.TraceFlags = trace_flags_1.TraceFlags;
var utils_2 = __require$b ?? _default_default$b ?? _mod12;
exports$b.createTraceState = utils_2.createTraceState;
var spancontext_utils_1 = __require$y ?? _default_default$y ?? _mod13;
exports$b.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
exports$b.isValidTraceId = spancontext_utils_1.isValidTraceId;
exports$b.isValidSpanId = spancontext_utils_1.isValidSpanId;
var invalid_span_constants_1 = __require$B ?? _default_default$B ?? _mod14;
exports$b.INVALID_SPANID = invalid_span_constants_1.INVALID_SPANID;
exports$b.INVALID_TRACEID = invalid_span_constants_1.INVALID_TRACEID;
exports$b.INVALID_SPAN_CONTEXT = invalid_span_constants_1.INVALID_SPAN_CONTEXT;
const context_api_1 = __require$e ?? _default_default$e ?? _mod15;
exports$b.context = context_api_1.context;
const diag_api_1 = __require$f ?? _default_default$f ?? _mod16;
exports$b.diag = diag_api_1.diag;
const metrics_api_1 = __require$g ?? _default_default$g ?? _mod17;
exports$b.metrics = metrics_api_1.metrics;
const propagation_api_1 = __require$k ?? _default_default$k ?? _mod18;
exports$b.propagation = propagation_api_1.propagation;
const trace_api_1 = __require$s ?? _default_default$s ?? _mod19;
exports$b.trace = trace_api_1.trace;
exports$b.default = {
  context: context_api_1.context,
  diag: diag_api_1.diag,
  metrics: metrics_api_1.metrics,
  propagation: propagation_api_1.propagation,
  trace: trace_api_1.trace
};
exports$b.baggageEntryMetadataFromString;
exports$b.createContextKey;
exports$b.ROOT_CONTEXT;
exports$b.DiagConsoleLogger;
exports$b.DiagLogLevel;
exports$b.createNoopMeter;
exports$b.ValueType;
exports$b.defaultTextMapGetter;
exports$b.defaultTextMapSetter;
exports$b.ProxyTracer;
exports$b.ProxyTracerProvider;
exports$b.SamplingDecision;
exports$b.SpanKind;
var _SpanStatusCode = exports$b.SpanStatusCode;
exports$b.TraceFlags;
exports$b.createTraceState;
var _isSpanContextValid = exports$b.isSpanContextValid;
exports$b.isValidTraceId;
exports$b.isValidSpanId;
exports$b.INVALID_SPANID;
exports$b.INVALID_TRACEID;
exports$b.INVALID_SPAN_CONTEXT;
exports$b.context;
exports$b.diag;
exports$b.metrics;
exports$b.propagation;
var _trace = exports$b.trace;
if (typeof exports$b === "object" && exports$b !== null && "default" in exports$b) {
  exports$b.default;
}
exports$b.__esModule;
let BUILD_ID = "ff36ae9ee3d10da2ca4643df88ff59ca8b811185";
const DENO_DEPLOYMENT_ID = void 0;
function setBuildId(id) {
  BUILD_ID = id;
}
const {
  Deno: Deno$1
} = globalThis;
const noColor = typeof Deno$1?.noColor === "boolean" ? Deno$1.noColor : false;
let enabled = !noColor;
function code(open, close) {
  return {
    open: `\x1B[${open.join(";")}m`,
    close: `\x1B[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g")
  };
}
function run(str, code2) {
  return enabled ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}
function bold(str) {
  return run(str, code([1], 22));
}
function cyan(str) {
  return run(str, code([36], 39));
}
function clampAndTruncate(n2, max = 255, min = 0) {
  return Math.trunc(Math.max(Math.min(n2, max), min));
}
function rgb8(str, color) {
  return run(str, code([38, 5, clampAndTruncate(color)], 39));
}
function bgRgb8(str, color) {
  return run(str, code([48, 5, clampAndTruncate(color)], 49));
}
var n$3, l$5, u$6, t$4, i$5, r$6, o$4, e$4, f$7, c$5, s$5, a$5, h$5, p$5, v$5, y$5, d$5 = {}, w$7 = [], _$4 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, g$7 = Array.isArray;
function m$5(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function b$4(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function k$7(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n$3.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return x$7(l2, e2, i2, r2, null);
}
function x$7(n2, t2, i2, r2, o2) {
  var e2 = {
    type: n2,
    props: t2,
    key: i2,
    ref: r2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: null == o2 ? ++u$6 : o2,
    __i: -1,
    __u: 0
  };
  return null == o2 && null != l$5.vnode && l$5.vnode(e2), e2;
}
function M$4() {
  return {
    current: null
  };
}
function S$1(n2) {
  return n2.children;
}
function C$6(n2, l2) {
  this.props = n2, this.context = l2;
}
function $$4(n2, l2) {
  if (null == l2) return n2.__ ? $$4(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? $$4(n2) : null;
}
function I$4(n2) {
  if (n2.__P && n2.__d) {
    var u2 = n2.__v, t2 = u2.__e, i2 = [], r2 = [], o2 = m$5({}, u2);
    o2.__v = u2.__v + 1, l$5.vnode && l$5.vnode(o2), q$7(n2.__P, o2, u2, n2.__n, n2.__P.namespaceURI, 32 & u2.__u ? [t2] : null, i2, null == t2 ? $$4(u2) : t2, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, D$6(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t2 && P$6(o2);
  }
}
function P$6(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l2) {
    if (null != l2 && null != l2.__e) return n2.__e = n2.__c.base = l2.__e;
  }), P$6(n2);
}
function A$7(n2) {
  (!n2.__d && (n2.__d = true) && i$5.push(n2) && !H$4.__r++ || r$6 != l$5.debounceRendering) && ((r$6 = l$5.debounceRendering) || o$4)(H$4);
}
function H$4() {
  try {
    for (var n2, l2 = 1; i$5.length; ) i$5.length > l2 && i$5.sort(e$4), n2 = i$5.shift(), l2 = i$5.length, I$4(n2);
  } finally {
    i$5.length = H$4.__r = 0;
  }
}
function L$3(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, v2, y2, _2, g2, m2 = t2 && t2.__k || w$7, b2 = l2.length;
  for (f2 = T$5(u2, l2, m2, f2, b2), a2 = 0; a2 < b2; a2++) null != (p2 = u2.__k[a2]) && (h2 = -1 != p2.__i && m2[p2.__i] || d$5, p2.__i = a2, _2 = q$7(n2, p2, h2, i2, r2, o2, e2, f2, c2, s2), v2 = p2.__e, p2.ref && h2.ref != p2.ref && (h2.ref && J$3(h2.ref, null, p2), s2.push(p2.ref, p2.__c || v2, p2)), null == y2 && null != v2 && (y2 = v2), (g2 = !!(4 & p2.__u)) || h2.__k === p2.__k ? (f2 = j$5(p2, f2, n2, g2), g2 && h2.__e && (h2.__e = null)) : "function" == typeof p2.type && void 0 !== _2 ? f2 = _2 : v2 && (f2 = v2.nextSibling), p2.__u &= -7);
  return u2.__e = y2, f2;
}
function T$5(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = x$7(null, o2, null, null, null) : g$7(o2) ? o2 = n2.__k[r2] = x$7(S$1, {
    children: o2
  }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = x$7(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h2, o2.__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = O$4(o2, u2, f2, a2)) && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > s2 ? h2-- : i2 < s2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (a2) for (r2 = 0; r2 < s2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = $$4(e2)), K$3(e2, e2));
  return t2;
}
function j$5(n2, l2, u2, t2) {
  var i2, r2;
  if ("function" == typeof n2.type) {
    for (i2 = n2.__k, r2 = 0; i2 && r2 < i2.length; r2++) i2[r2] && (i2[r2].__ = n2, l2 = j$5(i2[r2], l2, u2, t2));
    return l2;
  }
  n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = $$4(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function F$6(n2, l2) {
  return l2 = l2 || [], null == n2 || "boolean" == typeof n2 || (g$7(n2) ? n2.some(function(n3) {
    F$6(n3, l2);
  }) : l2.push(n2)), l2;
}
function O$4(n2, l2, u2, t2) {
  var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], s2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == e2 || s2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (s2 ? 1 : 0)) {
    for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
  }
  return -1;
}
function z$7(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || _$4.test(l2) ? u2 : u2 + "px";
}
function N$4(n2, l2, u2, t2, i2) {
  var r2, o2;
  n: if ("style" == l2) {
    if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || z$7(n2.style, l2, "");
      if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || z$7(n2.style, l2, u2[l2]);
    }
  } else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(a$5, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2[s$5] = t2[s$5] : (u2[s$5] = h$5, n2.addEventListener(l2, r2 ? v$5 : p$5, r2)) : n2.removeEventListener(l2, r2 ? v$5 : p$5, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function V$3(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2[c$5]) u2[c$5] = h$5++;
      else if (u2[c$5] < t2[s$5]) return;
      return t2(l$5.event ? l$5.event(u2) : u2);
    }
  };
}
function q$7(n2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, v2, y2, d2, _2, k2, x2, M2, $2, I2, P2, A2, H2, T2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (a2 = l$5.__b) && a2(u2);
  n: if ("function" == typeof T2) try {
    if (k2 = u2.props, x2 = T2.prototype && T2.prototype.render, M2 = (a2 = T2.contextType) && i2[a2.__c], $2 = a2 ? M2 ? M2.props.value : a2.__ : i2, t2.__c ? _2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (x2 ? u2.__c = h2 = new T2(k2, $2) : (u2.__c = h2 = new C$6(k2, $2), h2.constructor = T2, h2.render = Q$3), M2 && M2.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), x2 && null == h2.__s && (h2.__s = h2.state), x2 && null != T2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = m$5({}, h2.__s)), m$5(h2.__s, T2.getDerivedStateFromProps(k2, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) x2 && null == T2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), x2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (x2 && null == T2.getDerivedStateFromProps && k2 !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(k2, $2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(k2, h2.__s, $2)) {
        u2.__v != t2.__v && (h2.props = k2, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
          n3 && (n3.__ = u2);
        }), w$7.push.apply(h2.__h, h2._sb), h2._sb = [], h2.__h.length && e2.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(k2, h2.__s, $2), x2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(v2, y2, d2);
      });
    }
    if (h2.context = $2, h2.props = k2, h2.__P = n2, h2.__e = false, I2 = l$5.__r, P2 = 0, x2) h2.state = h2.__s, h2.__d = false, I2 && I2(u2), a2 = h2.render(h2.props, h2.state, h2.context), w$7.push.apply(h2.__h, h2._sb), h2._sb = [];
    else do {
      h2.__d = false, I2 && I2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++P2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i2 = m$5(m$5({}, i2), h2.getChildContext())), x2 && !p2 && null != h2.getSnapshotBeforeUpdate && (d2 = h2.getSnapshotBeforeUpdate(v2, y2)), A2 = null != a2 && a2.type === S$1 && null == a2.key ? E$3(a2.props.children) : a2, f2 = L$3(n2, g$7(A2) ? A2 : [A2], u2, t2, i2, r2, o2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), _2 && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u2.__v = null, c2 || null != o2) {
      if (n3.then) {
        for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
        o2[o2.indexOf(f2)] = null, u2.__e = f2;
      } else {
        for (H2 = o2.length; H2--; ) b$4(o2[H2]);
        B$6(u2);
      }
    } else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || B$6(u2);
    l$5.__e(n3, u2, t2);
  }
  else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = G$4(t2.__e, u2, t2, i2, r2, o2, e2, c2, s2);
  return (a2 = l$5.diffed) && a2(u2), 128 & u2.__u ? void 0 : f2;
}
function B$6(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B$6));
}
function D$6(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) J$3(t2[i2], t2[++i2], t2[++i2]);
  l$5.__c && l$5.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$5.__e(n3, u3.__v);
    }
  });
}
function E$3(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g$7(n2) ? n2.map(E$3) : m$5({}, n2);
}
function G$4(u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, v2, y2, w2, _2, m2 = i2.props || d$5, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (a2 = 0; a2 < e2.length; a2++) if ((y2 = e2[a2]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
      u2 = y2, e2[a2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$5.__m && l$5.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) m2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = e2 && n$3.call(u2.childNodes), !c2 && null != e2) for (m2 = {}, a2 = 0; a2 < u2.attributes.length; a2++) m2[(y2 = u2.attributes[a2]).name] = y2.value;
    for (a2 in m2) y2 = m2[a2], "dangerouslySetInnerHTML" == a2 ? p2 = y2 : "children" == a2 || a2 in k2 || "value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2 || N$4(u2, a2, null, y2, o2);
    for (a2 in k2) y2 = k2[a2], "children" == a2 ? v2 = y2 : "dangerouslySetInnerHTML" == a2 ? h2 = y2 : "value" == a2 ? w2 = y2 : "checked" == a2 ? _2 = y2 : c2 && "function" != typeof y2 || m2[a2] === y2 || N$4(u2, a2, y2, m2[a2], o2);
    if (h2) c2 || p2 && (h2.__html == p2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (p2 && (u2.innerHTML = ""), L$3("template" == t2.type ? u2.content : u2, g$7(v2) ? v2 : [v2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && $$4(i2, 0), c2, s2), null != e2) for (a2 = e2.length; a2--; ) b$4(e2[a2]);
    c2 || (a2 = "value", "progress" == x2 && null == w2 ? u2.removeAttribute("value") : null != w2 && (w2 !== u2[a2] || "progress" == x2 && !w2 || "option" == x2 && w2 != m2[a2]) && N$4(u2, a2, w2, m2[a2], o2), a2 = "checked", null != _2 && _2 != u2[a2] && N$4(u2, a2, _2, m2[a2], o2));
  }
  return u2;
}
function J$3(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$5.__e(n3, t2);
  }
}
function K$3(n2, u2, t2) {
  var i2, r2;
  if (l$5.unmount && l$5.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || J$3(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$5.__e(n3, u2);
    }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && K$3(i2[r2], u2, t2 || "function" != typeof n2.type);
  t2 || b$4(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function Q$3(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function R$4(u2, t2, i2) {
  var r2, o2, e2, f2;
  t2 == document && (t2 = document.documentElement), l$5.__ && l$5.__(u2, t2), o2 = (r2 = "function" == typeof i2) ? null : i2 && i2.__k || t2.__k, e2 = [], f2 = [], q$7(t2, u2 = (!r2 && i2 || t2).__k = k$7(S$1, null, [u2]), o2 || d$5, d$5, t2.namespaceURI, !r2 && i2 ? [i2] : o2 ? null : t2.firstChild ? n$3.call(t2.childNodes) : null, e2, !r2 && i2 ? i2 : o2 ? o2.__e : t2.firstChild, r2, f2), D$6(e2, u2, f2);
}
function U$4(n2, l2) {
  R$4(n2, l2, U$4);
}
function W$4(l2, u2, t2) {
  var i2, r2, o2, e2, f2 = m$5({}, l2.props);
  for (o2 in l2.type && l2.type.defaultProps && (e2 = l2.type.defaultProps), u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : f2[o2] = void 0 === u2[o2] && null != e2 ? e2[o2] : u2[o2];
  return arguments.length > 2 && (f2.children = arguments.length > 3 ? n$3.call(arguments, 2) : t2), x$7(l2.type, f2, i2 || l2.key, r2 || l2.ref, null);
}
function X$4(n2) {
  function l2(n3) {
    var u2, t2;
    return this.getChildContext || (u2 = /* @__PURE__ */ new Set(), (t2 = {})[l2.__c] = this, this.getChildContext = function() {
      return t2;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, A$7(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + y$5++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n$3 = w$7.slice, l$5 = {
  __e: function(n2, l2, u2, t2) {
    for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
    } catch (l3) {
      n2 = l3;
    }
    throw n2;
  }
}, u$6 = 0, t$4 = function(n2) {
  return null != n2 && void 0 === n2.constructor;
}, C$6.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$5({}, this.state), "function" == typeof n2 && (n2 = n2(m$5({}, u2), this.props)), n2 && m$5(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), A$7(this));
}, C$6.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), A$7(this));
}, C$6.prototype.render = S$1, i$5 = [], o$4 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$4 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, H$4.__r = 0, f$7 = Math.random().toString(8), c$5 = "__d" + f$7, s$5 = "__a" + f$7, a$5 = /(PointerCapture)$|Capture$/i, h$5 = 0, p$5 = V$3(false), v$5 = V$3(true), y$5 = 0;
var t$3 = /["&<]/;
function n$2(r2) {
  if (0 === r2.length || false === t$3.test(r2)) return r2;
  for (var e2 = 0, n2 = 0, o2 = "", f2 = ""; n2 < r2.length; n2++) {
    switch (r2.charCodeAt(n2)) {
      case 34:
        f2 = "&quot;";
        break;
      case 38:
        f2 = "&amp;";
        break;
      case 60:
        f2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== e2 && (o2 += r2.slice(e2, n2)), o2 += f2, e2 = n2 + 1;
  }
  return n2 !== e2 && (o2 += r2.slice(e2, n2)), o2;
}
var f$6 = 0, i$4 = Array.isArray;
function u$5(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = {
    type: e2,
    props: p2,
    key: n2,
    ref: a2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: --f$6,
    __i: -1,
    __u: 0,
    __source: i2,
    __self: u2
  };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$5.vnode && l$5.vnode(l2), l2;
}
function a$4(r2) {
  var t2 = u$5(S$1, {
    tpl: r2,
    exprs: [].slice.call(arguments, 1)
  });
  return t2.key = t2.__v, t2;
}
function s$4(r2) {
  if (null == r2 || "boolean" == typeof r2 || "function" == typeof r2) return null;
  if ("object" == typeof r2) {
    if (void 0 === r2.constructor) return r2;
    if (i$4(r2)) {
      for (var e2 = 0; e2 < r2.length; e2++) r2[e2] = s$4(r2[e2]);
      return r2;
    }
  }
  return n$2("" + r2);
}
class HttpError extends Error {
  /**
   * The HTTP status code.
   *
   * @example Basic usage
   * ```ts
   * import { App, HttpError } from "fresh";
   * import { expect } from "@std/expect";
   *
   * const app = new App()
   *   .get("/", () => new Response("ok"))
   *   .get("/not-found", () => {
   *      throw new HttpError(404, "Nothing here");
   *    });
   *
   * const handler = app.handler();
   *
   * try {
   *   await handler(new Request("http://localhost/not-found"))
   * } catch (error) {
   *   expect(error).toBeInstanceOf(HttpError);
   *   expect(error.status).toBe(404);
   *   expect(error.message).toBe("Nothing here");
   * }
   * ```
   */
  status;
  /**
   * Constructs a new instance.
   *
   * @param status The HTTP status code.
   * @param message The error message. Defaults to the status text of the given
   * status code.
   * @param options Optional error options.
   */
  constructor(status, message, options2) {
    super(message, options2);
    this.name = this.constructor.name;
    this.status = status;
  }
}
const INTERNAL_PREFIX = "/_frsh";
const DEV_ERROR_OVERLAY_URL = `${INTERNAL_PREFIX}/error_overlay`;
const PARTIAL_SEARCH_PARAM = "fresh-partial";
const ASSET_CACHE_BUST_KEY = "__frsh_c";
const DATA_CURRENT = "data-current";
const DATA_ANCESTOR = "data-ancestor";
const DATA_FRESH_KEY = "data-frsh-key";
const CLIENT_NAV_ATTR = "f-client-nav";
var OptionsType = /* @__PURE__ */ (function(OptionsType2) {
  OptionsType2["ATTR"] = "attr";
  OptionsType2["VNODE"] = "vnode";
  OptionsType2["HOOK"] = "__h";
  OptionsType2["DIFF"] = "__b";
  OptionsType2["RENDER"] = "__r";
  OptionsType2["DIFFED"] = "diffed";
  OptionsType2["ERROR"] = "__e";
  return OptionsType2;
})({});
function matchesUrl(current, needle, currentSearch) {
  const needleUrl = new URL(needle, "http://localhost");
  let href = needleUrl.pathname;
  const needleSearch = needleUrl.search;
  if (href !== "/" && href.endsWith("/")) {
    href = href.slice(0, -1);
  }
  if (current !== "/" && current.endsWith("/")) {
    current = current.slice(0, -1);
  }
  if (current === href) {
    if (needleSearch && currentSearch !== void 0 && needleSearch !== currentSearch) {
      return 1;
    }
    return 2;
  } else if (current.startsWith(href + "/") || href === "/") {
    return 1;
  }
  return 0;
}
function setActiveUrl(vnode, pathname, search) {
  const props = vnode.props;
  const hrefProp = props.href;
  if (typeof hrefProp === "string" && hrefProp.startsWith("/")) {
    if (props["aria-current"] !== void 0) return;
    const match = matchesUrl(pathname, hrefProp, search);
    if (match === 2) {
      props[DATA_CURRENT] = "true";
      props["aria-current"] = "page";
    } else if (match === 1) {
      props[DATA_ANCESTOR] = "true";
      props["aria-current"] = "true";
    }
  }
}
var PartialMode = /* @__PURE__ */ (function(PartialMode2) {
  PartialMode2[PartialMode2["Replace"] = 0] = "Replace";
  PartialMode2[PartialMode2["Append"] = 1] = "Append";
  PartialMode2[PartialMode2["Prepend"] = 2] = "Prepend";
  return PartialMode2;
})({});
function assetInternal(path, buildId) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  try {
    const url = new URL(path, "https://freshassetcache.local");
    if (url.protocol !== "https:" || url.host !== "freshassetcache.local" || url.searchParams.has(ASSET_CACHE_BUST_KEY)) {
      return path;
    }
    url.searchParams.set(ASSET_CACHE_BUST_KEY, buildId);
    return url.pathname + url.search + url.hash;
  } catch (err) {
    console.warn(`Failed to create asset() URL, falling back to regular path ('${path}'):`, err);
    return path;
  }
}
function assetSrcSetInternal(srcset, buildId) {
  if (srcset.includes("(")) return srcset;
  const parts = srcset.split(",");
  const constructed = [];
  for (const part of parts) {
    const trimmed = part.trimStart();
    const leadingWhitespace = part.length - trimmed.length;
    if (trimmed === "") return srcset;
    let urlEnd = trimmed.indexOf(" ");
    if (urlEnd === -1) urlEnd = trimmed.length;
    const leading = part.substring(0, leadingWhitespace);
    const url = trimmed.substring(0, urlEnd);
    const trailing = trimmed.substring(urlEnd);
    constructed.push(leading + assetInternal(url, buildId) + trailing);
  }
  return constructed.join(",");
}
function assetHashingHook(vnode, buildId) {
  if (vnode.type === "img" || vnode.type === "source") {
    const {
      props
    } = vnode;
    if (props["data-fresh-disable-lock"]) return;
    if (typeof props.src === "string") {
      props.src = assetInternal(props.src, buildId);
    }
    if (typeof props.srcset === "string") {
      props.srcset = assetSrcSetInternal(props.srcset, buildId);
    }
  }
}
const HeadContext = X$4(false);
function asset(path) {
  return assetInternal(path, BUILD_ID);
}
function Partial(props) {
  return props.children;
}
Partial.displayName = "Partial";
const UNDEFINED = -1;
const NULL = -2;
const NAN = -3;
const INFINITY_POS = -4;
const INFINITY_NEG = -5;
const ZERO_NEG = -6;
const HOLE = -7;
function stringify(data, custom) {
  const out = [];
  const indexes = /* @__PURE__ */ new Map();
  const res = serializeInner(out, indexes, data, custom);
  if (res < 0) {
    return String(res);
  }
  return `[${out.join(",")}]`;
}
function serializeInner(out, indexes, value, custom) {
  const seenIdx = indexes.get(value);
  if (seenIdx !== void 0) return seenIdx;
  if (value === void 0) return UNDEFINED;
  if (value === null) return NULL;
  if (Number.isNaN(value)) return NAN;
  if (value === Infinity) return INFINITY_POS;
  if (value === -Infinity) return INFINITY_NEG;
  if (value === 0 && 1 / value < 0) return ZERO_NEG;
  const idx = out.length;
  out.push("");
  indexes.set(value, idx);
  let str = "";
  if (typeof value === "number") {
    str += String(value);
  } else if (typeof value === "boolean") {
    str += String(value);
  } else if (typeof value === "bigint") {
    str += `["BigInt","${value}"]`;
  } else if (typeof value === "string") {
    str += JSON.stringify(value);
  } else if (Array.isArray(value)) {
    str += "[";
    for (let i2 = 0; i2 < value.length; i2++) {
      if (i2 in value) {
        str += serializeInner(out, indexes, value[i2], custom);
      } else {
        str += HOLE;
      }
      if (i2 < value.length - 1) {
        str += ",";
      }
    }
    str += "]";
  } else if (typeof value === "object") {
    if (custom !== void 0) {
      for (const k2 in custom) {
        const fn2 = custom[k2];
        if (fn2 === void 0) continue;
        const res = fn2(value);
        if (res === void 0) continue;
        const innerIdx = serializeInner(out, indexes, res.value, custom);
        str = `["${k2}",${innerIdx}]`;
        out[idx] = str;
        return idx;
      }
    }
    if (value instanceof URL) {
      str += `["URL","${value.href}"]`;
    } else if (value instanceof Date) {
      let iso;
      try {
        iso = value.toISOString();
      } catch {
        iso = "Invalid Date";
      }
      str += `["Date","${iso}"]`;
    } else if (value instanceof RegExp) {
      str += `["RegExp",${JSON.stringify(value.source)}, "${value.flags}"]`;
    } else if (value instanceof Uint8Array) {
      str += `["Uint8Array","${b64encode(value.buffer)}"]`;
    } else if (value instanceof Set) {
      const items2 = new Array(value.size);
      let i2 = 0;
      value.forEach((v2) => {
        items2[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Set",[${items2.join(",")}]]`;
    } else if (value instanceof Map) {
      const items2 = new Array(value.size * 2);
      let i2 = 0;
      value.forEach((v2, k2) => {
        items2[i2++] = serializeInner(out, indexes, k2, custom);
        items2[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Map",[${items2.join(",")}]]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.Instant) {
      str += `["Temporal.Instant","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.ZonedDateTime) {
      str += `["Temporal.ZonedDateTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainDate) {
      str += `["Temporal.PlainDate","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainTime) {
      str += `["Temporal.PlainTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainDateTime) {
      str += `["Temporal.PlainDateTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainYearMonth) {
      str += `["Temporal.PlainYearMonth","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainMonthDay) {
      str += `["Temporal.PlainMonthDay","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.Duration) {
      str += `["Temporal.Duration","${value.toString()}"]`;
    } else {
      str += "{";
      const keys = Object.keys(value);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        str += JSON.stringify(key) + ":";
        str += serializeInner(out, indexes, value[key], custom);
        if (i2 < keys.length - 1) {
          str += ",";
        }
      }
      str += "}";
    }
  } else if (typeof value === "function") {
    throw new Error(`Serializing functions is not supported.`);
  }
  out[idx] = str;
  return idx;
}
const base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
function b64encode(buffer) {
  const uint8 = new Uint8Array(buffer);
  let result = "", i2;
  const l2 = uint8.length;
  for (i2 = 2; i2 < l2; i2 += 3) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2 | uint8[i2] >> 6];
    result += base64abc[uint8[i2] & 63];
  }
  if (i2 === l2 + 1) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4];
    result += "==";
  }
  if (i2 === l2) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
const rawToEntityEntries = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]];
Object.fromEntries([...rawToEntityEntries.map(([raw, entity]) => [entity, raw]), ["&apos;", "'"], ["&nbsp;", " "]]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[...rawToEntity.keys()].join("")}]`, "g");
function escape(str) {
  return str.replaceAll(rawRe, (m2) => rawToEntity.get(m2));
}
function tabs2Spaces(str) {
  return str.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length));
}
function createCodeFrame(text2, lineNum, columnNum) {
  const before = 2;
  const after = 3;
  const lines = text2.split("\n");
  if (lines.length <= lineNum || lines[lineNum].length < columnNum) {
    return;
  }
  const start = Math.max(0, lineNum - before);
  const end = Math.min(lines.length, lineNum + after + 1);
  const maxLineNum = String(end).length;
  const padding = " ".repeat(maxLineNum);
  const spaceLines = [];
  let maxLineLen = 0;
  for (let i2 = start; i2 < end; i2++) {
    const line = tabs2Spaces(lines[i2]);
    spaceLines.push(line);
    if (line.length > maxLineLen) maxLineLen = line.length;
  }
  const activeLine = spaceLines[lineNum - start];
  const count = Math.max(0, activeLine.length - lines[lineNum].length + columnNum);
  const sep = "|";
  let out = "";
  for (let i2 = 0; i2 < spaceLines.length; i2++) {
    const line = spaceLines[i2];
    const currentLine = (padding + (i2 + start + 1)).slice(-maxLineNum);
    if (i2 === lineNum - start) {
      out += `> ${currentLine} ${sep} ${line}
`;
      const columnMarker = "^";
      out += `  ${padding} ${sep} ${" ".repeat(count)}${columnMarker}
`;
    } else {
      out += `  ${currentLine} ${sep} ${line}
`;
    }
  }
  return out;
}
const STACK_FRAME = /^\s*at\s+(?:(.*)\s+)?\((.*):(\d+):(\d+)\)$/;
function getFirstUserFile(stack, rootDir) {
  const lines = stack.split("\n");
  for (let i2 = 0; i2 < lines.length; i2++) {
    const match = lines[i2].match(STACK_FRAME);
    if (match) {
      const fnName = match[1] ?? "";
      const file = match[2];
      const line = +match[3];
      const column = +match[4];
      if (file.startsWith("file://")) {
        const filePath = fromFileUrl(file);
        if (relative(rootDir, filePath).startsWith(".")) {
          continue;
        }
        return {
          fnName,
          file,
          line,
          column
        };
      }
    }
  }
}
function getCodeFrame(stack, rootDir) {
  const file = getFirstUserFile(stack, rootDir);
  if (file) {
    try {
      const filePath = fromFileUrl(file.file);
      const text2 = Deno.readTextFileSync(filePath);
      return createCodeFrame(text2, file.line - 1, file.column - 1);
    } catch {
    }
  }
}
const SCRIPT_ESCAPE = /<\/(style|script)/gi;
const COMMENT_ESCAPE = /<!--/gi;
function escapeScript(content, options2 = {}) {
  return content.replaceAll(SCRIPT_ESCAPE, "<\\/$1").replaceAll(COMMENT_ESCAPE, options2.json ? "\\u003C!--" : "\\x3C!--");
}
function isLazy(value) {
  return typeof value === "function";
}
var t$2, r$5, u$4, i$3, o$3 = 0, f$5 = [], c$4 = l$5, e$3 = c$4.__b, a$3 = c$4.__r, v$4 = c$4.diffed, l$4 = c$4.__c, m$4 = c$4.unmount, s$3 = c$4.__;
function p$4(n2, t2) {
  c$4.__h && c$4.__h(r$5, n2, o$3 || t2), o$3 = 0;
  var u2 = r$5.__H || (r$5.__H = {
    __: [],
    __h: []
  });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d$4(n2) {
  return o$3 = 1, h$4(D$5, n2);
}
function h$4(n2, u2, i2) {
  var o2 = p$4(t$2++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [i2 ? i2(u2) : D$5(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r$5, !r$5.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      })) return !c2 || c2.call(this, n3, t2, r2);
      var i3 = o2.__c.props !== n3;
      return u3.some(function(n4) {
        if (n4.__N) {
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2 && c2.call(this, n3, t2, r2) || i3;
    };
    r$5.__f = true;
    var c2 = r$5.shouldComponentUpdate, e2 = r$5.componentWillUpdate;
    r$5.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r$5.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function y$4(n2, u2) {
  var i2 = p$4(t$2++, 3);
  !c$4.__s && C$5(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r$5.__H.__h.push(i2));
}
function _$3(n2, u2) {
  var i2 = p$4(t$2++, 4);
  !c$4.__s && C$5(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r$5.__h.push(i2));
}
function A$6(n2) {
  return o$3 = 5, T$4(function() {
    return {
      current: n2
    };
  }, []);
}
function F$5(n2, t2, r2) {
  o$3 = 6, _$3(function() {
    if ("function" == typeof n2) {
      var r3 = n2(t2());
      return function() {
        n2(null), r3 && "function" == typeof r3 && r3();
      };
    }
    if (n2) return n2.current = t2(), function() {
      return n2.current = null;
    };
  }, null == r2 ? r2 : r2.concat(n2));
}
function T$4(n2, r2) {
  var u2 = p$4(t$2++, 7);
  return C$5(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function q$6(n2, t2) {
  return o$3 = 8, T$4(function() {
    return n2;
  }, t2);
}
function x$6(n2) {
  var u2 = r$5.context[n2.__c], i2 = p$4(t$2++, 9);
  return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r$5)), u2.props.value) : n2.__;
}
function P$5(n2, t2) {
  c$4.useDebugValue && c$4.useDebugValue(t2 ? t2(n2) : n2);
}
function g$6() {
  var n2 = p$4(t$2++, 11);
  if (!n2.__) {
    for (var u2 = r$5.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    var i2 = u2.__m || (u2.__m = [0, 0]);
    n2.__ = "P" + i2[0] + "-" + i2[1]++;
  }
  return n2.__;
}
function j$4() {
  for (var n2; n2 = f$5.shift(); ) {
    var t2 = n2.__H;
    if (n2.__P && t2) try {
      t2.__h.some(z$6), t2.__h.some(B$5), t2.__h = [];
    } catch (r2) {
      t2.__h = [], c$4.__e(r2, n2.__v);
    }
  }
}
c$4.__b = function(n2) {
  r$5 = null, e$3 && e$3(n2);
}, c$4.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s$3 && s$3(n2, t2);
}, c$4.__r = function(n2) {
  a$3 && a$3(n2), t$2 = 0;
  var i2 = (r$5 = n2.__c).__H;
  i2 && (u$4 === r$5 ? (i2.__h = [], r$5.__h = [], i2.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.some(z$6), i2.__h.some(B$5), i2.__h = [], t$2 = 0)), u$4 = r$5;
}, c$4.diffed = function(n2) {
  v$4 && v$4(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f$5.push(t2) && i$3 === c$4.requestAnimationFrame || ((i$3 = c$4.requestAnimationFrame) || w$6)(j$4)), t2.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u$4 = r$5 = null;
}, c$4.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.some(z$6), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B$5(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c$4.__e(r2, n3.__v);
    }
  }), l$4 && l$4(n2, t2);
}, c$4.unmount = function(n2) {
  m$4 && m$4(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.some(function(n3) {
    try {
      z$6(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c$4.__e(t2, r2.__v));
};
var k$6 = "function" == typeof requestAnimationFrame;
function w$6(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k$6 && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k$6 && (t2 = requestAnimationFrame(r2));
}
function z$6(n2) {
  var t2 = r$5, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r$5 = t2;
}
function B$5(n2) {
  var t2 = r$5;
  n2.__c = n2.__(), r$5 = t2;
}
function C$5(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D$5(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
const options = l$5;
class RenderState {
  ctx;
  buildCache;
  partialId;
  nonce;
  partialDepth;
  partialCount;
  error;
  // deno-lint-ignore no-explicit-any
  slots;
  // deno-lint-ignore no-explicit-any
  islandProps;
  islands;
  islandAssets;
  /** CSS assets already injected in `<head>` via `RemainingHead`. */
  injectedCss;
  // deno-lint-ignore no-explicit-any
  encounteredPartials;
  owners;
  ownerStack;
  headComponents;
  // TODO: merge into bitmask field
  renderedHtmlTag;
  renderedHtmlBody;
  renderedHtmlHead;
  hasRuntimeScript;
  /** Set to true when any element in the tree renders f-client-nav="true". */
  clientNavEnabled;
  /**
   * True when the page needs Fresh's client runtime (islands, client nav, or
   * `<Partial>` regions on a full document). Partial subresponses omit boot;
   * `encounteredPartials` must not force runtime for those requests.
   */
  get needsClientRuntime() {
    if (this.islands.size > 0 || this.clientNavEnabled) {
      return true;
    }
    if (!this.ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM) && this.encounteredPartials.size > 0) {
      return true;
    }
    return false;
  }
  constructor(ctx, buildCache, partialId) {
    this.ctx = ctx;
    this.buildCache = buildCache;
    this.partialId = partialId;
    this.partialDepth = 0;
    this.partialCount = 0;
    this.error = null;
    this.slots = [];
    this.islandProps = [];
    this.islands = /* @__PURE__ */ new Set();
    this.islandAssets = /* @__PURE__ */ new Set();
    this.injectedCss = /* @__PURE__ */ new Set();
    this.encounteredPartials = /* @__PURE__ */ new Set();
    this.owners = /* @__PURE__ */ new Map();
    this.ownerStack = [];
    this.headComponents = /* @__PURE__ */ new Map();
    this.renderedHtmlTag = false;
    this.renderedHtmlBody = false;
    this.renderedHtmlHead = false;
    this.hasRuntimeScript = false;
    this.clientNavEnabled = false;
    this.nonce = crypto.randomUUID().replace(/-/g, "");
  }
  clear() {
    this.islands.clear();
    this.encounteredPartials.clear();
    this.owners.clear();
    this.injectedCss.clear();
    this.slots = [];
    this.islandProps = [];
    this.ownerStack = [];
  }
}
let RENDER_STATE = null;
function setRenderState(state) {
  RENDER_STATE = state;
}
const oldVNodeHook = options[OptionsType.VNODE];
options[OptionsType.VNODE] = (vnode) => {
  if (RENDER_STATE !== null) {
    RENDER_STATE.owners.set(vnode, RENDER_STATE.ownerStack.at(-1));
    if (vnode.type === "a") {
      setActiveUrl(vnode, RENDER_STATE.ctx.url.pathname, RENDER_STATE.ctx.url.search);
    }
  }
  assetHashingHook(vnode, BUILD_ID);
  if (typeof vnode.type === "function") {
    if (vnode.type === Partial) {
      const props = vnode.props;
      const key = normalizeKey(vnode.key);
      const mode = !props.mode || props.mode === "replace" ? PartialMode.Replace : props.mode === "append" ? PartialMode.Append : PartialMode.Prepend;
      props.children = wrapWithMarker(props.children, "partial", `${props.name}:${mode}:${key}`);
    }
  } else if (typeof vnode.type === "string") {
    if (RENDER_STATE !== null && (vnode.type === "script" || vnode.type === "style")) {
      const props = vnode.props;
      if (!props.nonce) {
        props.nonce = RENDER_STATE.nonce;
      }
    }
    if (vnode.type === "body") {
      const scripts = k$7(FreshScripts, null);
      if (vnode.props.children == null) {
        vnode.props.children = scripts;
      } else if (Array.isArray(vnode.props.children)) {
        vnode.props.children.push(scripts);
      } else {
        vnode.props.children = [vnode.props.children, scripts];
      }
    }
    if (CLIENT_NAV_ATTR in vnode.props) {
      vnode.props[CLIENT_NAV_ATTR] = String(vnode.props[CLIENT_NAV_ATTR]);
    }
  }
  oldVNodeHook?.(vnode);
};
const oldAttrHook = options[OptionsType.ATTR];
options[OptionsType.ATTR] = (name, value) => {
  if (name === CLIENT_NAV_ATTR) {
    return `${CLIENT_NAV_ATTR}="${String(Boolean(value))}"`;
  } else if (name === "key") {
    return `${DATA_FRESH_KEY}="${escape(String(value))}"`;
  }
  return oldAttrHook?.(name, value);
};
const PATCHED = /* @__PURE__ */ new WeakSet();
function normalizeKey(key) {
  const value = key ?? "";
  const s2 = typeof value !== "string" ? String(value) : value;
  return s2.replaceAll(":", "_");
}
const oldDiff = options[OptionsType.DIFF];
options[OptionsType.DIFF] = (vnode) => {
  if (RENDER_STATE !== null) {
    patcher: if (typeof vnode.type === "function" && vnode.type !== S$1) {
      if (vnode.type === Partial) {
        RENDER_STATE.partialDepth++;
        const name = vnode.props.name;
        if (typeof name === "string") {
          if (RENDER_STATE.encounteredPartials.has(name)) {
            throw new Error(`Rendered response contains duplicate partial name: "${name}"`);
          }
          RENDER_STATE.encounteredPartials.add(name);
        }
        if (hasIslandOwner(RENDER_STATE, vnode)) {
          throw new Error(`<Partial> components cannot be used inside islands.`);
        }
        const mode = vnode.props.mode;
        if ((mode === "append" || mode === "prepend") && vnode.key == null) {
          console.warn(`<Partial name="${name}" mode="${mode}"> is missing a "key" prop. Without a key, Preact cannot correctly reconcile ${mode}ed children. Add a unique key to fix this.`);
        }
      } else if (!PATCHED.has(vnode)) {
        const island = RENDER_STATE.buildCache.islandRegistry.get(vnode.type);
        const insideIsland = hasIslandOwner(RENDER_STATE, vnode);
        if (island === void 0) {
          if (insideIsland) break patcher;
          if (vnode.key !== void 0) {
            const key = normalizeKey(vnode.key);
            const originalType2 = vnode.type;
            vnode.type = (props) => {
              const child = k$7(originalType2, props);
              PATCHED.add(child);
              return wrapWithMarker(child, "key", key);
            };
          }
          break patcher;
        }
        const {
          islands: islands2,
          islandProps,
          islandAssets
        } = RENDER_STATE;
        if (insideIsland) {
          for (let i2 = 0; i2 < island.css.length; i2++) {
            const css2 = island.css[i2];
            islandAssets.add(css2);
          }
          break patcher;
        }
        islands2.add(island);
        const originalType = vnode.type;
        vnode.type = (props) => {
          for (const name in props) {
            const value = props[name];
            if (name === "children" || t$4(value) && !isSignal(value)) {
              const slotId = RENDER_STATE.slots.length;
              RENDER_STATE.slots.push({
                id: slotId,
                name,
                vnode: value
              });
              props[name] = k$7(Slot, {
                name,
                id: slotId
              }, value);
            }
          }
          const propsIdx = islandProps.push({
            slots: [],
            props
          }) - 1;
          const child = k$7(originalType, props);
          PATCHED.add(child);
          const key = normalizeKey(vnode.key);
          return wrapWithMarker(child, "island", `${island.name}:${propsIdx}:${key}`);
        };
      }
    } else if (typeof vnode.type === "string") {
      switch (vnode.type) {
        case "html":
          RENDER_STATE.renderedHtmlTag = true;
          break;
        case "head": {
          RENDER_STATE.renderedHtmlHead = true;
          const entryAssets2 = RENDER_STATE.buildCache.getEntryAssets();
          const items2 = [];
          if (entryAssets2.length > 0) {
            for (let i2 = 0; i2 < entryAssets2.length; i2++) {
              const id = entryAssets2[i2];
              if (id.endsWith(".css")) {
                items2.push(
                  // deno-lint-ignore no-explicit-any
                  k$7("link", {
                    rel: "stylesheet",
                    href: asset(id)
                  })
                );
              }
            }
          }
          const activeSpan = _trace.getActiveSpan();
          if (activeSpan) {
            const spanCtx = activeSpan.spanContext();
            if (_isSpanContextValid(spanCtx)) {
              const flags = spanCtx.traceFlags & 1 ? "01" : "00";
              const traceparent = `00-${spanCtx.traceId}-${spanCtx.spanId}-${flags}`;
              items2.push(
                // deno-lint-ignore no-explicit-any
                k$7("meta", {
                  name: "traceparent",
                  content: traceparent
                })
              );
            }
          }
          items2.push(k$7(RemainingHead, null));
          if (Array.isArray(vnode.props.children)) {
            vnode.props.children.push(...items2);
          } else if (vnode.props.children !== null && typeof vnode.props.children === "object") {
            items2.unshift(vnode.props.children);
            vnode.props.children = items2;
          } else {
            vnode.props.children = items2;
          }
          break;
        }
        case "body":
          RENDER_STATE.renderedHtmlBody = true;
          break;
        case "title":
        case "meta":
        case "link":
        case "script":
        case "style":
        case "base":
        case "noscript":
        case "template":
          {
            if (PATCHED.has(vnode)) {
              break;
            }
            const originalType = vnode.type;
            let cacheKey = vnode.key ?? (originalType === "title" ? "title" : null);
            if (cacheKey === null) {
              const props = vnode.props;
              const keys = Object.keys(vnode.props);
              keys.sort();
              cacheKey = `${originalType}`;
              for (let i2 = 0; i2 < keys.length; i2++) {
                const key = keys[i2];
                if (key === "children" || key === "nonce" || key === "ref") {
                  continue;
                } else if (key === "dangerouslySetInnerHTML") {
                  cacheKey += String(props[key].__html);
                  continue;
                } else if (originalType === "meta" && key === "content") {
                  continue;
                } else if (originalType === "link" && key === "href") {
                  continue;
                }
                cacheKey += `::${props[key]}`;
              }
            }
            const originalKey = vnode.key;
            vnode.type = (props) => {
              const value = x$6(HeadContext);
              if (originalKey) {
                props["data-key"] = originalKey;
              }
              const vnode2 = k$7(originalType, props);
              PATCHED.add(vnode2);
              if (RENDER_STATE !== null) {
                if (value) {
                  RENDER_STATE.headComponents.set(cacheKey, vnode2);
                  return null;
                } else if (value !== void 0) {
                  const cached = RENDER_STATE.headComponents.get(cacheKey);
                  if (cached !== void 0) {
                    RENDER_STATE.headComponents.delete(cacheKey);
                    return cached;
                  }
                }
              }
              return vnode2;
            };
          }
          break;
      }
      if (CLIENT_NAV_ATTR in vnode.props && vnode.props[CLIENT_NAV_ATTR] === "true") {
        RENDER_STATE.clientNavEnabled = true;
      }
      if (vnode.key !== void 0 && (RENDER_STATE.partialDepth > 0 || hasIslandOwner(RENDER_STATE, vnode))) {
        vnode.props[DATA_FRESH_KEY] = String(vnode.key);
      }
    }
  }
  oldDiff?.(vnode);
};
const oldRender = options[OptionsType.RENDER];
options[OptionsType.RENDER] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== S$1 && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.push(vnode);
  }
  oldRender?.(vnode);
};
const oldDiffed = options[OptionsType.DIFFED];
options[OptionsType.DIFFED] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== S$1 && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.pop();
    if (vnode.type === Partial) {
      RENDER_STATE.partialDepth--;
    }
  }
  oldDiffed?.(vnode);
};
function RemainingHead() {
  if (RENDER_STATE !== null) {
    const items2 = [];
    if (RENDER_STATE.headComponents.size > 0) {
      items2.push(...RENDER_STATE.headComponents.values());
    }
    RENDER_STATE.islands.forEach((island) => {
      if (island.css.length > 0) {
        for (let i2 = 0; i2 < island.css.length; i2++) {
          const css2 = island.css[i2];
          if (!RENDER_STATE.injectedCss.has(css2)) {
            RENDER_STATE.injectedCss.add(css2);
            items2.push(k$7("link", {
              rel: "stylesheet",
              href: css2
            }));
          }
        }
      }
    });
    RENDER_STATE.islandAssets.forEach((css2) => {
      if (!RENDER_STATE.injectedCss.has(css2)) {
        RENDER_STATE.injectedCss.add(css2);
        items2.push(k$7("link", {
          rel: "stylesheet",
          href: css2
        }));
      }
    });
    if (items2.length > 0) {
      return k$7(S$1, null, items2);
    }
  }
  return null;
}
function Slot(props) {
  if (RENDER_STATE !== null) {
    RENDER_STATE.slots[props.id] = null;
  }
  return wrapWithMarker(props.children, "slot", `${props.id}:${props.name}`);
}
function hasIslandOwner(current, vnode) {
  let tmpVNode = vnode;
  let owner;
  while ((owner = current.owners.get(tmpVNode)) !== void 0) {
    if (current.buildCache.islandRegistry.has(owner.type)) {
      return true;
    }
    tmpVNode = owner;
  }
  return false;
}
function wrapWithMarker(vnode, kind, markerText) {
  return k$7(S$1, null, k$7(S$1, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: `frsh:${kind}:${markerText}`
  }), vnode, k$7(S$1, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: "/frsh:" + kind
  }));
}
function isSignal(x2) {
  return x2 !== null && typeof x2 === "object" && typeof x2.peek === "function" && "value" in x2;
}
function isComputedSignal(x2) {
  return isSignal(x2) && ("x" in x2 && typeof x2.x === "function" || "_fn" in x2 && typeof x2._fn === "function");
}
function isVNode(x2) {
  return x2 !== null && typeof x2 === "object" && "type" in x2 && "ref" in x2 && "__k" in x2 && t$4(x2);
}
const stringifiers = {
  Computed: (value) => {
    return isComputedSignal(value) ? {
      value: value.peek()
    } : void 0;
  },
  Signal: (value) => {
    return isSignal(value) ? {
      value: value.peek()
    } : void 0;
  },
  Slot: (value) => {
    if (isVNode(value) && value.type === Slot) {
      const props = value.props;
      return {
        value: {
          name: props.name,
          id: props.id
        }
      };
    }
  }
};
function FreshScripts() {
  if (RENDER_STATE === null) return null;
  if (RENDER_STATE.hasRuntimeScript) {
    return null;
  }
  RENDER_STATE.hasRuntimeScript = true;
  const {
    slots
  } = RENDER_STATE;
  const lateCssLinks = [];
  RENDER_STATE.islands.forEach((island) => {
    for (let i2 = 0; i2 < island.css.length; i2++) {
      const css2 = island.css[i2];
      if (!RENDER_STATE.injectedCss.has(css2)) {
        RENDER_STATE.injectedCss.add(css2);
        lateCssLinks.push(k$7("link", {
          rel: "stylesheet",
          href: css2
        }));
      }
    }
  });
  RENDER_STATE.islandAssets.forEach((css2) => {
    if (!RENDER_STATE.injectedCss.has(css2)) {
      RENDER_STATE.injectedCss.add(css2);
      lateCssLinks.push(k$7("link", {
        rel: "stylesheet",
        href: css2
      }));
    }
  });
  return k$7(S$1, null, ...lateCssLinks, slots.map((slot) => {
    if (slot === null) return null;
    return k$7("template", {
      key: slot.id,
      id: `frsh-${slot.id}-${slot.name}`
    }, slot.vnode);
  }), k$7(FreshRuntimeScript, null));
}
function FreshRuntimeScript() {
  const {
    islands: islands2,
    nonce,
    ctx,
    islandProps,
    partialId,
    buildCache
  } = RENDER_STATE;
  const basePath = ctx.config.basePath;
  const islandArr = Array.from(islands2);
  if (ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
    const islands22 = islandArr.map((island) => {
      return {
        exportName: island.exportName,
        chunk: island.file,
        name: island.name
      };
    });
    const serializedProps = stringify(islandProps, stringifiers);
    const json = {
      islands: islands22,
      props: serializedProps
    };
    return k$7("script", {
      id: `__FRSH_STATE_${partialId}`,
      type: "application/json",
      dangerouslySetInnerHTML: {
        __html: escapeScript(JSON.stringify(json), {
          json: true
        })
      }
    });
  } else if (RENDER_STATE.needsClientRuntime || buildCache.hmrClientEntry !== void 0) {
    const islandImports = islandArr.map((island) => {
      const named = island.exportName === "default" ? island.name : island.exportName === island.name ? `{ ${island.exportName} }` : `{ ${island.exportName} as ${island.name} }`;
      const islandSpec = island.file.startsWith(".") ? island.file.slice(1) : island.file;
      return `import ${named} from "${basePath}${islandSpec}";`;
    }).join("");
    const islandObj = "{" + islandArr.map((island) => island.name).join(",") + "}";
    const serializedProps = escapeScript(JSON.stringify(stringify(islandProps, stringifiers)), {
      json: true
    });
    const runtimeUrl = buildCache.clientEntry.startsWith(".") ? buildCache.clientEntry.slice(1) : buildCache.clientEntry;
    const scriptContent = `import { boot } from "${basePath}${runtimeUrl}";${islandImports}boot(${islandObj},${serializedProps});`;
    return k$7(S$1, null, k$7("script", {
      type: "module",
      nonce,
      dangerouslySetInnerHTML: {
        __html: scriptContent
      }
    }), buildCache.features.errorOverlay ? k$7(ShowErrorOverlay, null) : null);
  }
  return buildCache.features.errorOverlay ? k$7(ShowErrorOverlay, null) : null;
}
function ShowErrorOverlay() {
  if (RENDER_STATE === null) return null;
  const {
    ctx
  } = RENDER_STATE;
  const error = ctx.error;
  if (error === null || error === void 0) return null;
  if (error instanceof HttpError && error.status < 500) {
    return null;
  }
  const basePath = ctx.config.basePath;
  const searchParams = new URLSearchParams();
  if (typeof error === "object") {
    if ("message" in error) {
      searchParams.append("message", String(error.message));
    }
    if ("stack" in error && typeof error.stack === "string") {
      searchParams.append("stack", error.stack);
      const codeFrame = getCodeFrame(error.stack, ctx.config.root);
      if (codeFrame !== void 0) {
        searchParams.append("code-frame", codeFrame);
      }
    }
  } else {
    searchParams.append("message", String(error));
  }
  return k$7("iframe", {
    id: "fresh-error-overlay",
    src: `${basePath}${DEV_ERROR_OVERLAY_URL}?${searchParams.toString()}`,
    style: "unset: all; position: fixed; top: 0; left: 0; z-index: 99999; width: 100%; height: 100%; border: none;"
  });
}
const NONCE_SYMBOL = /* @__PURE__ */ Symbol.for("__freshNonce");
const version$1 = "2.3.3";
const denoJson = {
  version: version$1
};
const CURRENT_FRESH_VERSION = denoJson.version;
const tracer = _trace.getTracer("fresh", CURRENT_FRESH_VERSION);
function recordSpanError(span, err) {
  if (err instanceof Error) {
    span.recordException(err);
  } else {
    span.setStatus({
      code: _SpanStatusCode.ERROR,
      message: String(err)
    });
  }
}
function isAsyncAnyComponent(fn2) {
  return typeof fn2 === "function" && fn2.constructor.name === "AsyncFunction";
}
async function renderAsyncAnyComponent(fn2, props) {
  return await tracer.startActiveSpan("invoke async component", async (span) => {
    span.setAttribute("fresh.span_type", "fs_routes/async_component");
    try {
      const result = await fn2(props);
      span.setAttribute("fresh.component_response", result instanceof Response ? "http" : "jsx");
      return result;
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}
async function renderRouteComponent(ctx, def, child) {
  const vnodeProps = {
    Component: child,
    config: ctx.config,
    data: def.props,
    error: ctx.error,
    info: ctx.info,
    isPartial: ctx.isPartial,
    params: ctx.params,
    req: ctx.req,
    state: ctx.state,
    url: ctx.url,
    route: ctx.route
  };
  if (isAsyncAnyComponent(def.component)) {
    const result = await renderAsyncAnyComponent(def.component, vnodeProps);
    if (result instanceof Response) {
      return result;
    }
    return result;
  }
  return k$7(def.component, vnodeProps);
}
var r$4 = "diffed", o$2 = "__c", i$2 = "__s", a$2 = "__c", c$3 = "__k", u$3 = "__d", s$2 = "__s", l$3 = /[\s\n\\/='"\0<>]/, f$4 = /^(xlink|xmlns|xml)([A-Z])/, p$3 = /^(?:accessK|auto[A-Z]|cell|ch|col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z])/, h$3 = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, d$3 = /* @__PURE__ */ new Set(["draggable", "spellcheck"]);
function v$3(e2) {
  void 0 !== e2.__g ? e2.__g |= 8 : e2[u$3] = true;
}
function m$3(e2) {
  void 0 !== e2.__g ? e2.__g &= -9 : e2[u$3] = false;
}
function y$3(e2) {
  return void 0 !== e2.__g ? !!(8 & e2.__g) : true === e2[u$3];
}
var _$2 = /["&<]/;
function g$5(e2) {
  if (0 === e2.length || false === _$2.test(e2)) return e2;
  for (var t2 = 0, n2 = 0, r2 = "", o2 = ""; n2 < e2.length; n2++) {
    switch (e2.charCodeAt(n2)) {
      case 34:
        o2 = "&quot;";
        break;
      case 38:
        o2 = "&amp;";
        break;
      case 60:
        o2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== t2 && (r2 += e2.slice(t2, n2)), r2 += o2, t2 = n2 + 1;
  }
  return n2 !== t2 && (r2 += e2.slice(t2, n2)), r2;
}
var b$3 = {}, x$5 = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), k$5 = /[A-Z]/g;
function w$5(e2) {
  var t2 = "";
  for (var n2 in e2) {
    var r2 = e2[n2];
    if (null != r2 && "" !== r2) {
      var o2 = "-" == n2[0] ? n2 : b$3[n2] || (b$3[n2] = n2.replace(k$5, "-$&").toLowerCase()), i2 = ";";
      "number" != typeof r2 || o2.startsWith("--") || x$5.has(o2) || (i2 = "px;"), t2 = t2 + o2 + ":" + r2 + i2;
    }
  }
  return t2 || void 0;
}
function C$4() {
  this.__d = true;
}
function A$5(e2, t2) {
  return {
    __v: e2,
    context: t2,
    props: e2.props,
    setState: C$4,
    forceUpdate: C$4,
    __d: true,
    __h: new Array(0)
  };
}
var D$4, P$4, $$3, U$3, F$4 = {}, M$3 = [], W$3 = Array.isArray, z$5 = Object.assign, H$3 = "", N$3 = "<!--$s-->", q$5 = "<!--/$s-->";
function B$4(a2, u2, s2) {
  var l2 = l$5[i$2];
  l$5[i$2] = true, D$4 = l$5.__b, P$4 = l$5[r$4], $$3 = l$5.__r, U$3 = l$5.unmount;
  var f2 = k$7(S$1, null);
  f2[c$3] = [a2];
  try {
    var p2 = O$3(a2, u2 || F$4, false, void 0, f2, false, s2);
    return W$3(p2) ? p2.join(H$3) : p2;
  } catch (e2) {
    if (e2.then) throw new Error('Use "renderToStringAsync" for suspenseful rendering.');
    throw e2;
  } finally {
    l$5[o$2] && l$5[o$2](a2, M$3), l$5[i$2] = l2, M$3.length = 0;
  }
}
function I$3(e2, t2) {
  var n2, r2 = e2.type, o2 = true;
  return e2[a$2] ? (o2 = false, (n2 = e2[a$2]).state = n2[s$2]) : n2 = new r2(e2.props, t2), e2[a$2] = n2, n2.__v = e2, n2.props = e2.props, n2.context = t2, v$3(n2), null == n2.state && (n2.state = F$4), null == n2[s$2] && (n2[s$2] = n2.state), r2.getDerivedStateFromProps ? n2.state = z$5({}, n2.state, r2.getDerivedStateFromProps(n2.props, n2.state)) : o2 && n2.componentWillMount ? (n2.componentWillMount(), n2.state = n2[s$2] !== n2.state ? n2[s$2] : n2.state) : !o2 && n2.componentWillUpdate && n2.componentWillUpdate(), $$3 && $$3(e2), n2.render(n2.props, n2.state, t2);
}
function O$3(t2, r2, o2, i2, u2, _2, b2) {
  if (null == t2 || true === t2 || false === t2 || t2 === H$3) return H$3;
  var x2 = typeof t2;
  if ("object" != x2) return "function" == x2 ? H$3 : "string" == x2 ? g$5(t2) : t2 + H$3;
  if (W$3(t2)) {
    var k2, C2 = H$3;
    u2[c$3] = t2;
    for (var S2 = t2.length, L2 = 0; L2 < S2; L2++) {
      var E2 = t2[L2];
      if (null != E2 && "boolean" != typeof E2) {
        var j2, T2 = O$3(E2, r2, o2, i2, u2, _2, b2);
        "string" == typeof T2 ? C2 += T2 : (k2 || (k2 = new Array(S2)), C2 && k2.push(C2), C2 = H$3, W$3(T2) ? (j2 = k2).push.apply(j2, T2) : k2.push(T2));
      }
    }
    return k2 ? (C2 && k2.push(C2), k2) : C2;
  }
  if (void 0 !== t2.constructor) return H$3;
  t2.__ = u2, D$4 && D$4(t2);
  var Z2 = t2.type, M2 = t2.props;
  if ("function" == typeof Z2) {
    var B2, V2, K2, J2 = r2;
    if (Z2 === S$1) {
      if ("tpl" in M2) {
        for (var Q2 = H$3, X2 = 0; X2 < M2.tpl.length; X2++) if (Q2 += M2.tpl[X2], M2.exprs && X2 < M2.exprs.length) {
          var Y2 = M2.exprs[X2];
          if (null == Y2) continue;
          "object" != typeof Y2 || void 0 !== Y2.constructor && !W$3(Y2) ? Q2 += Y2 : Q2 += O$3(Y2, r2, o2, i2, t2, _2, b2);
        }
        return Q2;
      }
      if ("UNSTABLE_comment" in M2) return "<!--" + g$5(M2.UNSTABLE_comment) + "-->";
      V2 = M2.children;
    } else {
      if (null != (B2 = Z2.contextType)) {
        var ee = r2[B2.__c];
        J2 = ee ? ee.props.value : B2.__;
      }
      var te = Z2.prototype && "function" == typeof Z2.prototype.render;
      if (te) V2 = /**#__NOINLINE__**/
      I$3(t2, J2), K2 = t2[a$2];
      else {
        t2[a$2] = K2 = /**#__NOINLINE__**/
        A$5(t2, J2);
        for (var ne = 0; y$3(K2) && ne++ < 25; ) {
          m$3(K2), $$3 && $$3(t2);
          try {
            V2 = Z2.call(K2, M2, J2);
          } catch (e2) {
            throw e2;
          }
        }
        v$3(K2);
      }
      if (null != K2.getChildContext && (r2 = z$5({}, r2, K2.getChildContext())), te && l$5.errorBoundaries && (Z2.getDerivedStateFromError || K2.componentDidCatch)) {
        V2 = null != V2 && V2.type === S$1 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2;
        try {
          return O$3(V2, r2, o2, i2, t2, _2, false);
        } catch (e2) {
          return Z2.getDerivedStateFromError && (K2[s$2] = Z2.getDerivedStateFromError(e2)), K2.componentDidCatch && K2.componentDidCatch(e2, F$4), y$3(K2) ? (V2 = I$3(t2, r2), null != (K2 = t2[a$2]).getChildContext && (r2 = z$5({}, r2, K2.getChildContext())), O$3(V2 = null != V2 && V2.type === S$1 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2, r2, o2, i2, t2, _2, b2)) : H$3;
        } finally {
          P$4 && P$4(t2), U$3 && U$3(t2);
        }
      }
    }
    V2 = null != V2 && V2.type === S$1 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2;
    try {
      var re2 = O$3(V2, r2, o2, i2, t2, _2, b2);
      return P$4 && P$4(t2), l$5.unmount && l$5.unmount(t2), t2._suspended ? "string" == typeof re2 ? N$3 + re2 + q$5 : W$3(re2) ? (re2.unshift(N$3), re2.push(q$5), re2) : re2.then(function(e2) {
        return N$3 + e2 + q$5;
      }) : re2;
    } catch (n2) {
      if (b2 && b2.onError) {
        var oe = (function e2(n3) {
          return b2.onError(n3, t2, function(t3, n4) {
            try {
              return O$3(t3, r2, o2, i2, n4, _2, b2);
            } catch (t4) {
              return e2(t4);
            }
          });
        })(n2);
        if (void 0 !== oe) return oe;
        var ie = l$5.__e;
        return ie && ie(n2, t2), H$3;
      }
      throw n2;
    }
  }
  var ae, ce = "<" + Z2, ue = H$3;
  for (var se in M2) {
    var le = M2[se];
    if ("function" != typeof (le = G$3(le) ? le.value : le) || "class" === se || "className" === se) {
      switch (se) {
        case "children":
          ae = le;
          continue;
        case "key":
        case "ref":
        case "__self":
        case "__source":
          continue;
        case "htmlFor":
          if ("for" in M2) continue;
          se = "for";
          break;
        case "className":
          if ("class" in M2) continue;
          se = "class";
          break;
        case "defaultChecked":
          se = "checked";
          break;
        case "defaultSelected":
          se = "selected";
          break;
        case "defaultValue":
        case "value":
          switch (se = "value", Z2) {
            case "textarea":
              ae = le;
              continue;
            case "select":
              i2 = le;
              continue;
            case "option":
              i2 != le || "selected" in M2 || (ce += " selected");
          }
          break;
        case "dangerouslySetInnerHTML":
          ue = le && le.__html;
          continue;
        case "style":
          "object" == typeof le && (le = w$5(le));
          break;
        case "acceptCharset":
          se = "accept-charset";
          break;
        case "httpEquiv":
          se = "http-equiv";
          break;
        default:
          if (f$4.test(se)) se = se.replace(f$4, "$1:$2").toLowerCase();
          else {
            if (l$3.test(se)) continue;
            "-" !== se[4] && !d$3.has(se) || null == le ? o2 ? h$3.test(se) && (se = "panose1" === se ? "panose-1" : se.replace(/([A-Z])/g, "-$1").toLowerCase()) : p$3.test(se) && (se = se.toLowerCase()) : le += H$3;
          }
      }
      null != le && false !== le && (ce = true === le || le === H$3 ? ce + " " + se : ce + " " + se + '="' + ("string" == typeof le ? g$5(le) : le + H$3) + '"');
    }
  }
  if (l$3.test(Z2)) throw new Error(Z2 + " is not a valid HTML tag name in " + ce + ">");
  if (ue || ("string" == typeof ae ? ue = g$5(ae) : null != ae && false !== ae && true !== ae && (ue = O$3(ae, r2, "svg" === Z2 || "foreignObject" !== Z2 && o2, i2, t2, _2, b2))), P$4 && P$4(t2), U$3 && U$3(t2), !ue && R$3.has(Z2)) return ce + "/>";
  var fe = "</" + Z2 + ">", pe = ce + ">";
  return W$3(ue) ? [pe].concat(ue, [fe]) : "string" != typeof ue ? [pe, ue, fe] : pe + ue + fe;
}
var R$3 = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
function G$3(e2) {
  return null !== e2 && "object" == typeof e2 && "function" == typeof e2.peek && "value" in e2;
}
const ENCODER = new TextEncoder();
function isWebSocketHandlers(value) {
  if (typeof value !== "object" || value === null) return false;
  const v2 = value;
  return typeof v2.open === "function" || typeof v2.message === "function" || typeof v2.close === "function" || typeof v2.error === "function";
}
let getBuildCache;
let getInternals;
let setAdditionalStyles;
class Context {
  constructor(req, url, info, route, params, config2, next, buildCache) {
    __privateAdd(this, _internal, {
      app: null,
      layouts: []
    });
    /** Reference to the resolved Fresh configuration */
    __publicField(this, "config");
    /**
     * The request url parsed into an `URL` instance. This is typically used
     * to apply logic based on the pathname of the incoming url or when
     * certain search parameters are set.
     */
    __publicField(this, "url");
    /** The original incoming {@linkcode Request} object. */
    __publicField(this, "req");
    /** The matched route pattern. */
    __publicField(this, "route");
    /** The url parameters of the matched route pattern. */
    __publicField(this, "params");
    /** State object that is shared with all middlewares. */
    __publicField(this, "state", {});
    __publicField(this, "data");
    /** Error value if an error was caught (Default: null) */
    __publicField(this, "error", null);
    __publicField(this, "info");
    /**
     * Whether the current Request is a partial request.
     *
     * Partials in Fresh will append the query parameter
     * {@linkcode PARTIAL_SEARCH_PARAM} to the URL. This property can
     * be used to determine if only `<Partial>`'s need to be rendered.
     */
    __publicField(this, "isPartial");
    /**
     * Call the next middleware.
     * ```ts
     * const myMiddleware: Middleware = (ctx) => {
     *   // do something
     *
     *   // Call the next middleware
     *   return ctx.next();
     * }
     *
     * const myMiddleware2: Middleware = async (ctx) => {
     *   // do something before the next middleware
     *   doSomething()
     *
     *   const res = await ctx.next();
     *
     *   // do something after the middleware
     *   doSomethingAfter()
     *
     *   // Return the `Response`
     *   return res
     * }
     */
    __publicField(this, "next");
    __privateAdd(this, _buildCache);
    __privateAdd(this, _additionalStyles, null);
    __publicField(this, "Component");
    this.url = url;
    this.req = req;
    this.info = info;
    this.params = params;
    this.route = route;
    this.config = config2;
    this.isPartial = url.searchParams.has(PARTIAL_SEARCH_PARAM);
    this.next = next;
    __privateSet(this, _buildCache, buildCache);
  }
  /**
   * Return a redirect response to the specified path. This is the
   * preferred way to do redirects in Fresh.
   *
   * ```ts
   * ctx.redirect("/foo/bar") // redirect user to "<yoursite>/foo/bar"
   *
   * // Disallows protocol relative URLs for improved security. This
   * // redirects the user to `<yoursite>/evil.com` which is safe,
   * // instead of redirecting to `http://evil.com`.
   * ctx.redirect("//evil.com/");
   * ```
   */
  redirect(pathOrUrl, status = 302) {
    let location = pathOrUrl;
    if (pathOrUrl !== "/" && pathOrUrl.startsWith("/")) {
      let idx = pathOrUrl.indexOf("?");
      if (idx === -1) {
        idx = pathOrUrl.indexOf("#");
      }
      const pathname = idx > -1 ? pathOrUrl.slice(0, idx) : pathOrUrl;
      const search = idx > -1 ? pathOrUrl.slice(idx) : "";
      location = `${pathname.replaceAll(/\/+/g, "/")}${search}`;
    }
    if (this.isPartial) {
      const hashIdx = location.indexOf("#");
      const base = hashIdx > -1 ? location.slice(0, hashIdx) : location;
      const hash = hashIdx > -1 ? location.slice(hashIdx) : "";
      const separator = base.includes("?") ? "&" : "?";
      location = `${base}${separator}${PARTIAL_SEARCH_PARAM}=true${hash}`;
    }
    return new Response(null, {
      status,
      headers: {
        location
      }
    });
  }
  /**
   * Render JSX and return an HTML `Response` instance.
   * ```tsx
   * ctx.render(<h1>hello world</h1>);
   * ```
   */
  async render(vnode, init = {}, config2 = {}) {
    if (arguments.length === 0) {
      throw new Error(`No arguments passed to: ctx.render()`);
    } else if (vnode !== null && !t$4(vnode)) {
      throw new Error(`Non-JSX element passed to: ctx.render()`);
    }
    const defs = config2.skipInheritedLayouts ? [] : __privateGet(this, _internal).layouts;
    const appDef = config2.skipAppWrapper ? null : __privateGet(this, _internal).app;
    const props = this;
    for (let i2 = defs.length - 1; i2 >= 0; i2--) {
      const child = vnode;
      props.Component = () => child;
      const def = defs[i2];
      const result = await renderRouteComponent(this, def, () => child);
      if (result instanceof Response) {
        return result;
      }
      vnode = result;
    }
    let appChild = vnode;
    let appVNode;
    let hasApp = true;
    if (isAsyncAnyComponent(appDef)) {
      props.Component = () => appChild;
      const result = await renderAsyncAnyComponent(appDef, props);
      if (result instanceof Response) {
        return result;
      }
      appVNode = result;
    } else if (appDef !== null) {
      appVNode = k$7(appDef, {
        Component: () => appChild,
        config: this.config,
        data: null,
        error: this.error,
        info: this.info,
        isPartial: this.isPartial,
        params: this.params,
        req: this.req,
        state: this.state,
        url: this.url,
        route: this.route
      });
    } else {
      hasApp = false;
      appVNode = appChild ?? k$7(S$1, null);
    }
    const headers = getHeadersFromInit(init);
    headers.set("Content-Type", "text/html; charset=utf-8");
    const responseInit = {
      status: init.status ?? 200,
      headers,
      statusText: init.statusText
    };
    let partialId = "";
    if (this.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
      partialId = crypto.randomUUID();
      headers.set("X-Fresh-Id", partialId);
    }
    let renderNonce = "";
    const html2 = tracer.startActiveSpan("render", (span) => {
      span.setAttribute("fresh.span_type", "render");
      const state = new RenderState(this, __privateGet(this, _buildCache), partialId);
      if (__privateGet(this, _additionalStyles) !== null) {
        for (let i2 = 0; i2 < __privateGet(this, _additionalStyles).length; i2++) {
          const css2 = __privateGet(this, _additionalStyles)[i2];
          state.islandAssets.add(css2);
        }
      }
      try {
        setRenderState(state);
        let html3 = B$4(vnode ?? k$7(S$1, null));
        if (hasApp) {
          appChild = a$4([html3]);
          html3 = B$4(appVNode);
        }
        if (!state.renderedHtmlBody || !state.renderedHtmlHead || !state.renderedHtmlTag) {
          let fallback = a$4([html3]);
          if (!state.renderedHtmlBody) {
            let scripts = null;
            if (this.url.pathname !== this.config.basePath + DEV_ERROR_OVERLAY_URL) {
              scripts = k$7(FreshScripts, null);
            }
            fallback = k$7("body", null, fallback, scripts);
          }
          if (!state.renderedHtmlHead) {
            fallback = k$7(S$1, null, k$7("head", null, k$7("meta", {
              charset: "utf-8"
            })), fallback);
          }
          if (!state.renderedHtmlTag) {
            fallback = k$7("html", null, fallback);
          }
          html3 = B$4(fallback);
        }
        return `<!DOCTYPE html>${html3}`;
      } catch (err) {
        if (err instanceof Error) {
          span.recordException(err);
        } else {
          span.setStatus({
            code: _SpanStatusCode.ERROR,
            message: String(err)
          });
        }
        throw err;
      } finally {
        const basePath = this.config.basePath;
        const linkParts = [];
        if (state.needsClientRuntime || state.buildCache.hmrClientEntry !== void 0) {
          const runtimeUrl = state.buildCache.clientEntry.startsWith(".") ? state.buildCache.clientEntry.slice(1) : state.buildCache.clientEntry;
          linkParts.push(`<${encodeURI(`${basePath}${runtimeUrl}`)}>; rel="modulepreload"; as="script"`);
          state.islands.forEach((island) => {
            const specifier = `${basePath}${island.file.startsWith(".") ? island.file.slice(1) : island.file}`;
            linkParts.push(`<${encodeURI(specifier)}>; rel="modulepreload"; as="script"`);
          });
        }
        if (linkParts.length > 0) {
          headers.append("Link", linkParts.join(", "));
        }
        renderNonce = state.nonce;
        state.clear();
        setRenderState(null);
        span.end();
      }
    });
    const response = new Response(html2, responseInit);
    response[NONCE_SYMBOL] = renderNonce;
    return response;
  }
  /**
   * Respond with text. Sets `Content-Type: text/plain`.
   * ```tsx
   * app.use(ctx => ctx.text("Hello World!"));
   * ```
   */
  text(content, init) {
    return new Response(content, init);
  }
  /**
   * Respond with html string. Sets `Content-Type: text/html`.
   * ```tsx
   * app.get("/", ctx => ctx.html("<h1>foo</h1>"));
   * ```
   */
  html(content, init) {
    const headers = getHeadersFromInit(init);
    headers.set("Content-Type", "text/html; charset=utf-8");
    return new Response(content, {
      ...init,
      headers
    });
  }
  /**
   * Respond with json string, same as `Response.json()`. Sets
   * `Content-Type: application/json`.
   * ```tsx
   * app.get("/", ctx => ctx.json({ foo: 123 }));
   * ```
   */
  // deno-lint-ignore no-explicit-any
  json(content, init) {
    return Response.json(content, init);
  }
  /**
   * Helper to stream a sync or async iterable and encode text
   * automatically.
   *
   * ```tsx
   * function* gen() {
   *   yield "foo";
   *   yield "bar";
   * }
   *
   * app.use(ctx => ctx.stream(gen()))
   * ```
   *
   * Or pass in the function directly:
   *
   * ```tsx
   * app.use(ctx => {
   *   return ctx.stream(function* gen() {
   *     yield "foo";
   *     yield "bar";
   *   });
   * );
   * ```
   */
  stream(stream, init) {
    const raw = typeof stream === "function" ? stream() : stream;
    const body = ReadableStream.from(raw).pipeThrough(new TransformStream({
      transform(chunk, controller) {
        if (chunk instanceof Uint8Array) {
          controller.enqueue(chunk);
        } else if (chunk === void 0) {
          controller.enqueue(void 0);
        } else {
          const raw2 = ENCODER.encode(String(chunk));
          controller.enqueue(raw2);
        }
      }
    }));
    return new Response(body, init);
  }
  upgrade(handlersOrOptions, maybeOptions) {
    let handlers2;
    let options2;
    if (isWebSocketHandlers(handlersOrOptions)) {
      handlers2 = handlersOrOptions;
      options2 = maybeOptions;
    } else {
      options2 = handlersOrOptions;
    }
    if (this.req.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      throw new HttpError(400, "Expected a WebSocket upgrade request");
    }
    const {
      socket,
      response
    } = Deno.upgradeWebSocket(this.req, options2);
    if (handlers2 === void 0) {
      return {
        socket,
        response
      };
    }
    if (handlers2.open) {
      socket.addEventListener("open", () => handlers2.open(socket));
    }
    if (handlers2.message) {
      socket.addEventListener("message", (ev) => handlers2.message(socket, ev));
    }
    if (handlers2.close) {
      socket.addEventListener("close", (ev) => handlers2.close(socket, ev.code, ev.reason));
    }
    if (handlers2.error) {
      socket.addEventListener("error", (ev) => handlers2.error(socket, ev));
    }
    return response;
  }
}
_internal = new WeakMap();
_buildCache = new WeakMap();
_additionalStyles = new WeakMap();
getInternals = (ctx) => __privateGet(ctx, _internal);
getBuildCache = (ctx) => __privateGet(ctx, _buildCache);
setAdditionalStyles = (ctx, css2) => __privateSet(ctx, _additionalStyles, css2);
function getHeadersFromInit(init) {
  if (init === void 0) {
    return new Headers();
  }
  return init.headers !== void 0 ? init.headers instanceof Headers ? init.headers : new Headers(init.headers) : new Headers();
}
function newByMethod() {
  return {
    GET: null,
    POST: null,
    PATCH: null,
    DELETE: null,
    PUT: null,
    HEAD: null,
    OPTIONS: null
  };
}
const IS_PATTERN = /[*:{}+?()]/;
const EMPTY$3 = [];
class UrlPatternRouter {
  #statics = /* @__PURE__ */ new Map();
  #dynamics = /* @__PURE__ */ new Map();
  #dynamicArr = [];
  #allowed = /* @__PURE__ */ new Map();
  getAllowedMethods(pattern) {
    const allowed = this.#allowed.get(pattern);
    if (allowed === void 0) return EMPTY$3;
    return Array.from(allowed);
  }
  add(method, pathname, item) {
    let allowed = this.#allowed.get(pathname);
    if (allowed === void 0) {
      allowed = /* @__PURE__ */ new Set();
      this.#allowed.set(pathname, allowed);
    }
    allowed.add(method);
    let byMethod;
    if (IS_PATTERN.test(pathname)) {
      let def = this.#dynamics.get(pathname);
      if (def === void 0) {
        def = {
          pattern: new URLPattern({
            pathname
          }),
          byMethod: newByMethod()
        };
        this.#dynamics.set(pathname, def);
        this.#dynamicArr.push(def);
      }
      byMethod = def.byMethod;
    } else {
      let def = this.#statics.get(pathname);
      if (def === void 0) {
        def = {
          pattern: pathname,
          byMethod: newByMethod()
        };
        this.#statics.set(pathname, def);
      }
      byMethod = def.byMethod;
    }
    if (byMethod[method] === null) {
      byMethod[method] = item;
    }
  }
  match(method, url) {
    const result = {
      params: /* @__PURE__ */ Object.create(null),
      item: null,
      methodMatch: false,
      pattern: null
    };
    let pathname = url.pathname;
    let staticMatch = this.#statics.get(pathname);
    if (staticMatch === void 0 && pathname !== "/") {
      const alt = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname + "/";
      const altMatch = this.#statics.get(alt);
      if (altMatch !== void 0) {
        staticMatch = altMatch;
        pathname = alt;
      }
    }
    if (staticMatch !== void 0) {
      result.pattern = pathname;
      let item = staticMatch.byMethod[method];
      if (method === "HEAD" && item === null) {
        item = staticMatch.byMethod.GET;
      }
      if (item !== null) {
        result.methodMatch = true;
        result.item = item;
      }
      return result;
    }
    for (let i2 = 0; i2 < this.#dynamicArr.length; i2++) {
      const route = this.#dynamicArr[i2];
      const match = route.pattern.exec(url);
      if (match === null) continue;
      result.pattern = route.pattern.pathname;
      let item = route.byMethod[method];
      if (method === "HEAD" && item === null) {
        item = route.byMethod.GET;
      }
      if (item !== null) {
        result.methodMatch = true;
        result.item = item;
        for (const [key, value] of Object.entries(match.pathname.groups)) {
          result.params[key] = value === void 0 ? "" : decodeURI(value);
        }
      }
      break;
    }
    return result;
  }
}
function patternToSegments(path, root2, includeLast = false) {
  const out = [root2];
  if (path === "/" || path === "*" || path === "/*") return out;
  const cleaned = path.replace(/\{[^}]*\}\??/g, "");
  let start = -1;
  for (let i2 = 0; i2 < cleaned.length; i2++) {
    const ch = cleaned[i2];
    if (ch === "/") {
      if (i2 > 0) {
        const raw = cleaned.slice(start + 1, i2);
        out.push(raw);
      }
      start = i2;
    }
  }
  if (includeLast && start < cleaned.length - 1) {
    out.push(cleaned.slice(start + 1));
  }
  return out;
}
function mergePath(basePath, path, isMounting) {
  if (basePath.endsWith("*")) basePath = basePath.slice(0, -1);
  if (basePath === "/") basePath = "";
  if (path === "*") path = isMounting ? "" : "/*";
  else if (path === "/*") path = "/*";
  const s2 = basePath !== "" && path === "/" ? "" : path;
  return basePath + s2;
}
function toRoutePath(path) {
  if (path === "") return "*";
  return path;
}
const STATUS_CODE = {
  /** RFC 7231, 6.2.1 */
  Continue: 100,
  /** RFC 7231, 6.2.2 */
  SwitchingProtocols: 101,
  /** RFC 2518, 10.1 */
  Processing: 102,
  /** RFC 8297 **/
  EarlyHints: 103,
  /** RFC 7231, 6.3.1 */
  OK: 200,
  /** RFC 7231, 6.3.2 */
  Created: 201,
  /** RFC 7231, 6.3.3 */
  Accepted: 202,
  /** RFC 7231, 6.3.4 */
  NonAuthoritativeInfo: 203,
  /** RFC 7231, 6.3.5 */
  NoContent: 204,
  /** RFC 7231, 6.3.6 */
  ResetContent: 205,
  /** RFC 7233, 4.1 */
  PartialContent: 206,
  /** RFC 4918, 11.1 */
  MultiStatus: 207,
  /** RFC 5842, 7.1 */
  AlreadyReported: 208,
  /** RFC 3229, 10.4.1 */
  IMUsed: 226,
  /** RFC 7231, 6.4.1 */
  MultipleChoices: 300,
  /** RFC 7231, 6.4.2 */
  MovedPermanently: 301,
  /** RFC 7231, 6.4.3 */
  Found: 302,
  /** RFC 7231, 6.4.4 */
  SeeOther: 303,
  /** RFC 7232, 4.1 */
  NotModified: 304,
  /** RFC 7231, 6.4.5 */
  UseProxy: 305,
  /** RFC 7231, 6.4.7 */
  TemporaryRedirect: 307,
  /** RFC 7538, 3 */
  PermanentRedirect: 308,
  /** RFC 7231, 6.5.1 */
  BadRequest: 400,
  /** RFC 7235, 3.1 */
  Unauthorized: 401,
  /** RFC 7231, 6.5.2 */
  PaymentRequired: 402,
  /** RFC 7231, 6.5.3 */
  Forbidden: 403,
  /** RFC 7231, 6.5.4 */
  NotFound: 404,
  /** RFC 7231, 6.5.5 */
  MethodNotAllowed: 405,
  /** RFC 7231, 6.5.6 */
  NotAcceptable: 406,
  /** RFC 7235, 3.2 */
  ProxyAuthRequired: 407,
  /** RFC 7231, 6.5.7 */
  RequestTimeout: 408,
  /** RFC 7231, 6.5.8 */
  Conflict: 409,
  /** RFC 7231, 6.5.9 */
  Gone: 410,
  /** RFC 7231, 6.5.10 */
  LengthRequired: 411,
  /** RFC 7232, 4.2 */
  PreconditionFailed: 412,
  /** RFC 7231, 6.5.11 */
  ContentTooLarge: 413,
  /** RFC 7231, 6.5.12 */
  URITooLong: 414,
  /** RFC 7231, 6.5.13 */
  UnsupportedMediaType: 415,
  /** RFC 7233, 4.4 */
  RangeNotSatisfiable: 416,
  /** RFC 7231, 6.5.14 */
  ExpectationFailed: 417,
  /** RFC 7168, 2.3.3 */
  Teapot: 418,
  /** RFC 7540, 9.1.2 */
  MisdirectedRequest: 421,
  /** RFC 4918, 11.2 */
  UnprocessableEntity: 422,
  /** RFC 4918, 11.3 */
  Locked: 423,
  /** RFC 4918, 11.4 */
  FailedDependency: 424,
  /** RFC 8470, 5.2 */
  TooEarly: 425,
  /** RFC 7231, 6.5.15 */
  UpgradeRequired: 426,
  /** RFC 6585, 3 */
  PreconditionRequired: 428,
  /** RFC 6585, 4 */
  TooManyRequests: 429,
  /** RFC 6585, 5 */
  RequestHeaderFieldsTooLarge: 431,
  /** RFC 7725, 3 */
  UnavailableForLegalReasons: 451,
  /** RFC 7231, 6.6.1 */
  InternalServerError: 500,
  /** RFC 7231, 6.6.2 */
  NotImplemented: 501,
  /** RFC 7231, 6.6.3 */
  BadGateway: 502,
  /** RFC 7231, 6.6.4 */
  ServiceUnavailable: 503,
  /** RFC 7231, 6.6.5 */
  GatewayTimeout: 504,
  /** RFC 7231, 6.6.6 */
  HTTPVersionNotSupported: 505,
  /** RFC 2295, 8.1 */
  VariantAlsoNegotiates: 506,
  /** RFC 4918, 11.5 */
  InsufficientStorage: 507,
  /** RFC 5842, 7.2 */
  LoopDetected: 508,
  /** RFC 2774, 7 */
  NotExtended: 510,
  /** RFC 6585, 6 */
  NetworkAuthenticationRequired: 511
};
const STATUS_TEXT = {
  [STATUS_CODE.Accepted]: "Accepted",
  [STATUS_CODE.AlreadyReported]: "Already Reported",
  [STATUS_CODE.BadGateway]: "Bad Gateway",
  [STATUS_CODE.BadRequest]: "Bad Request",
  [STATUS_CODE.Conflict]: "Conflict",
  [STATUS_CODE.Continue]: "Continue",
  [STATUS_CODE.Created]: "Created",
  [STATUS_CODE.EarlyHints]: "Early Hints",
  [STATUS_CODE.ExpectationFailed]: "Expectation Failed",
  [STATUS_CODE.FailedDependency]: "Failed Dependency",
  [STATUS_CODE.Forbidden]: "Forbidden",
  [STATUS_CODE.Found]: "Found",
  [STATUS_CODE.GatewayTimeout]: "Gateway Timeout",
  [STATUS_CODE.Gone]: "Gone",
  [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported",
  [STATUS_CODE.IMUsed]: "IM Used",
  [STATUS_CODE.InsufficientStorage]: "Insufficient Storage",
  [STATUS_CODE.InternalServerError]: "Internal Server Error",
  [STATUS_CODE.LengthRequired]: "Length Required",
  [STATUS_CODE.Locked]: "Locked",
  [STATUS_CODE.LoopDetected]: "Loop Detected",
  [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed",
  [STATUS_CODE.MisdirectedRequest]: "Misdirected Request",
  [STATUS_CODE.MovedPermanently]: "Moved Permanently",
  [STATUS_CODE.MultiStatus]: "Multi Status",
  [STATUS_CODE.MultipleChoices]: "Multiple Choices",
  [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required",
  [STATUS_CODE.NoContent]: "No Content",
  [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info",
  [STATUS_CODE.NotAcceptable]: "Not Acceptable",
  [STATUS_CODE.NotExtended]: "Not Extended",
  [STATUS_CODE.NotFound]: "Not Found",
  [STATUS_CODE.NotImplemented]: "Not Implemented",
  [STATUS_CODE.NotModified]: "Not Modified",
  [STATUS_CODE.OK]: "OK",
  [STATUS_CODE.PartialContent]: "Partial Content",
  [STATUS_CODE.PaymentRequired]: "Payment Required",
  [STATUS_CODE.PermanentRedirect]: "Permanent Redirect",
  [STATUS_CODE.PreconditionFailed]: "Precondition Failed",
  [STATUS_CODE.PreconditionRequired]: "Precondition Required",
  [STATUS_CODE.Processing]: "Processing",
  [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required",
  [STATUS_CODE.ContentTooLarge]: "Content Too Large",
  [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
  [STATUS_CODE.RequestTimeout]: "Request Timeout",
  [STATUS_CODE.URITooLong]: "URI Too Long",
  [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable",
  [STATUS_CODE.ResetContent]: "Reset Content",
  [STATUS_CODE.SeeOther]: "See Other",
  [STATUS_CODE.ServiceUnavailable]: "Service Unavailable",
  [STATUS_CODE.SwitchingProtocols]: "Switching Protocols",
  [STATUS_CODE.Teapot]: "I'm a teapot",
  [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect",
  [STATUS_CODE.TooEarly]: "Too Early",
  [STATUS_CODE.TooManyRequests]: "Too Many Requests",
  [STATUS_CODE.Unauthorized]: "Unauthorized",
  [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
  [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity",
  [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type",
  [STATUS_CODE.UpgradeRequired]: "Upgrade Required",
  [STATUS_CODE.UseProxy]: "Use Proxy",
  [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates"
};
function page(data, options2) {
  return {
    data: data ?? void 0,
    headers: options2?.headers,
    status: options2?.status
  };
}
function isHandlerByMethod(handler2) {
  return handler2 !== null && !Array.isArray(handler2) && typeof handler2 === "object";
}
function compileMiddlewares(middlewares, onError) {
  if (middlewares.length === 0) return (ctx) => ctx.next();
  let chain = (_ctx, tail) => tail();
  for (let i2 = middlewares.length - 1; i2 >= 0; i2--) {
    const nextChain = chain;
    let middleware = middlewares[i2];
    chain = async (ctx, tail) => {
      const internals = getInternals(ctx);
      const {
        app: prevApp,
        layouts: prevLayouts
      } = internals;
      ctx.next = () => Promise.resolve(nextChain(ctx, tail));
      try {
        const result = await middleware(ctx);
        if (typeof result === "function") {
          middleware = result;
          return await result(ctx);
        }
        return result;
      } catch (err) {
        if (ctx.error !== err) {
          ctx.error = err;
          if (onError !== void 0) {
            onError(err);
          }
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    };
  }
  const count = middlewares.length;
  return (ctx) => {
    const tail = ctx.next;
    return tracer.startActiveSpan("middlewares", {
      attributes: {
        "fresh.middleware.count": count
      }
    }, async (span) => {
      try {
        return await chain(ctx, tail);
      } catch (err) {
        recordSpanError(span, err);
        throw err;
      } finally {
        span.end();
      }
    });
  };
}
function newSegment(pattern, parent) {
  return {
    pattern,
    middlewares: [],
    layout: null,
    app: null,
    errorRoute: null,
    notFound: null,
    parent,
    children: /* @__PURE__ */ new Map()
  };
}
function getOrCreateSegment(root2, path, includeLast) {
  let current = root2;
  const segments = patternToSegments(path, root2.pattern, includeLast);
  for (let i2 = 0; i2 < segments.length; i2++) {
    const seg = segments[i2];
    if (seg === root2.pattern) {
      current = root2;
    } else {
      let child = current.children.get(seg);
      if (child === void 0) {
        child = newSegment(seg, current);
        current.children.set(seg, child);
      }
      current = child;
    }
  }
  return current;
}
function segmentToMiddlewares(segment) {
  const result = [];
  const stack = [];
  let current = segment;
  while (current !== null) {
    stack.push(current);
    current = current.parent;
  }
  const root2 = stack.at(-1);
  for (let i2 = stack.length - 1; i2 >= 0; i2--) {
    const seg = stack[i2];
    const {
      layout,
      app: app2,
      errorRoute
    } = seg;
    result.push(async function segmentMiddleware(ctx) {
      const internals = getInternals(ctx);
      const prevApp = internals.app;
      const prevLayouts = internals.layouts;
      if (app2 !== null) {
        internals.app = app2;
      }
      if (layout !== null) {
        if (layout.config?.skipAppWrapper) {
          internals.app = null;
        }
        const def = {
          props: null,
          component: layout.component
        };
        if (layout.config?.skipInheritedLayouts) {
          internals.layouts = [def];
        } else {
          internals.layouts = [...internals.layouts, def];
        }
      }
      try {
        return await ctx.next();
      } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        if (root2.notFound !== null && status === 404) {
          return await root2.notFound(ctx);
        }
        if (errorRoute !== null) {
          return await renderRoute(ctx, errorRoute, status);
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    });
    if (seg.middlewares.length > 0) {
      result.push(...seg.middlewares);
    }
  }
  return result;
}
async function renderRoute(ctx, route, status = 200) {
  const internals = getInternals(ctx);
  if (route.config?.skipAppWrapper) {
    internals.app = null;
  }
  if (route.config?.skipInheritedLayouts) {
    internals.layouts = [];
  }
  const method = ctx.req.method.toUpperCase();
  const handlers2 = route.handler;
  if (handlers2 === void 0) {
    throw new Error(`Unexpected missing handlers`);
  }
  const headers = new Headers();
  headers.set("Content-Type", "text/html;charset=utf-8");
  const res = await tracer.startActiveSpan("handler", {
    attributes: {
      "fresh.span_type": "fs_routes/handler"
    }
  }, async (span) => {
    try {
      let fn2 = null;
      if (isHandlerByMethod(handlers2)) {
        if (handlers2[method] !== void 0) {
          fn2 = handlers2[method];
        } else if (method === "HEAD" && handlers2.GET !== void 0) {
          fn2 = handlers2.GET;
        }
      } else {
        fn2 = handlers2;
      }
      if (fn2 === null) return await ctx.next();
      return await fn2(ctx);
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
  if (res instanceof Response) {
    return res;
  }
  if (typeof res.status === "number") {
    status = res.status;
  }
  if (res.headers !== void 0) {
    if (res.headers instanceof Headers) {
      res.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(res.headers)) {
      for (let i2 = 0; i2 < res.headers.length; i2++) {
        const entry = res.headers[i2];
        headers.set(entry[0], entry[1]);
      }
    } else {
      for (const [name, value] of Object.entries(res.headers)) {
        headers.set(name, value);
      }
    }
  }
  let vnode = null;
  if (route.component !== void 0) {
    const result = await renderRouteComponent(ctx, {
      component: route.component,
      // deno-lint-ignore no-explicit-any
      props: res.data
    }, () => null);
    if (result instanceof Response) {
      return result;
    }
    vnode = result;
  }
  return ctx.render(vnode, {
    headers,
    status
  });
}
const DEFAULT_NOT_FOUND = () => {
  throw new HttpError(404);
};
const DEFAULT_NOT_ALLOWED_METHOD = () => {
  throw new HttpError(405);
};
const DEFAULT_RENDER = () => (
  // deno-lint-ignore no-explicit-any
  Promise.resolve({
    data: {}
  })
);
function ensureHandler(route) {
  if (route.handler === void 0) {
    route.handler = route.component !== void 0 ? DEFAULT_RENDER : DEFAULT_NOT_FOUND;
  } else if (isHandlerByMethod(route.handler)) {
    if (route.component !== void 0 && !route.handler.GET) {
      route.handler.GET = DEFAULT_RENDER;
    }
  }
}
var CommandType = /* @__PURE__ */ (function(CommandType2) {
  CommandType2["Middleware"] = "middleware";
  CommandType2["Layout"] = "layout";
  CommandType2["App"] = "app";
  CommandType2["Route"] = "route";
  CommandType2["Error"] = "error";
  CommandType2["NotFound"] = "notFound";
  CommandType2["Handler"] = "handler";
  CommandType2["FsRoute"] = "fsRoute";
  return CommandType2;
})({});
function newErrorCmd(pattern, routeOrMiddleware, includeLastSegment) {
  const route = typeof routeOrMiddleware === "function" ? {
    handler: routeOrMiddleware
  } : routeOrMiddleware;
  ensureHandler(route);
  return {
    type: "error",
    pattern,
    item: route,
    includeLastSegment
  };
}
function newAppCmd(component) {
  return {
    type: "app",
    component
  };
}
function newLayoutCmd(pattern, component, config2, includeLastSegment) {
  return {
    type: "layout",
    pattern,
    component,
    config: config2,
    includeLastSegment
  };
}
function newMiddlewareCmd(pattern, fns, includeLastSegment) {
  return {
    type: "middleware",
    pattern,
    fns,
    includeLastSegment
  };
}
function newNotFoundCmd(routeOrMiddleware) {
  const route = typeof routeOrMiddleware === "function" ? {
    handler: routeOrMiddleware
  } : routeOrMiddleware;
  ensureHandler(route);
  return {
    type: "notFound",
    fn: (ctx) => renderRoute(ctx, route)
  };
}
function newRouteCmd(pattern, route, config2, includeLastSegment) {
  let normalized;
  if (isLazy(route)) {
    normalized = async () => {
      const result = await route();
      ensureHandler(result);
      return result;
    };
  } else {
    ensureHandler(route);
    normalized = route;
  }
  return {
    type: "route",
    pattern,
    route: normalized,
    config: config2,
    includeLastSegment
  };
}
function newHandlerCmd(method, pattern, fns, includeLastSegment) {
  return {
    type: "handler",
    pattern,
    method,
    fns,
    includeLastSegment
  };
}
function applyCommands(router, commands, basePath, onError) {
  const root2 = newSegment("", null);
  applyCommandsInner(root2, router, commands, basePath, onError);
  const rootMiddlewares = segmentToMiddlewares(root2);
  return {
    rootHandler: compileMiddlewares(rootMiddlewares, onError)
  };
}
function applyCommandsInner(root2, router, commands, basePath, onError) {
  for (let i2 = 0; i2 < commands.length; i2++) {
    const cmd = commands[i2];
    switch (cmd.type) {
      case "middleware": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.middlewares.push(...cmd.fns);
        break;
      }
      case "notFound": {
        root2.notFound = cmd.fn;
        break;
      }
      case "error": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.errorRoute = cmd.item;
        break;
      }
      case "app": {
        root2.app = cmd.component;
        break;
      }
      case "layout": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.layout = {
          component: cmd.component,
          config: cmd.config ?? null
        };
        break;
      }
      case "route": {
        const {
          pattern,
          route,
          config: config2
        } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const fns = segmentToMiddlewares(segment);
        if (isLazy(route)) {
          const routePath = mergePath(basePath, config2?.routeOverride ?? pattern, false);
          let def;
          fns.push(async (ctx) => {
            if (def === void 0) {
              def = await route();
            }
            if (def.css !== void 0) {
              setAdditionalStyles(ctx, def.css);
            }
            return renderRoute(ctx, def);
          });
          const compiled = compileMiddlewares(fns, onError);
          if (config2 === void 0 || config2.methods === "ALL") {
            router.add("GET", routePath, compiled);
            router.add("DELETE", routePath, compiled);
            router.add("HEAD", routePath, compiled);
            router.add("OPTIONS", routePath, compiled);
            router.add("PATCH", routePath, compiled);
            router.add("POST", routePath, compiled);
            router.add("PUT", routePath, compiled);
          } else if (Array.isArray(config2.methods)) {
            for (let i3 = 0; i3 < config2.methods.length; i3++) {
              const method = config2.methods[i3];
              router.add(method, routePath, compiled);
            }
          }
        } else {
          fns.push((ctx) => renderRoute(ctx, route));
          const routePath = toRoutePath(mergePath(basePath, route.config?.routeOverride ?? pattern, false));
          const compiled = compileMiddlewares(fns, onError);
          if (typeof route.handler === "function") {
            router.add("GET", routePath, compiled);
            router.add("DELETE", routePath, compiled);
            router.add("HEAD", routePath, compiled);
            router.add("OPTIONS", routePath, compiled);
            router.add("PATCH", routePath, compiled);
            router.add("POST", routePath, compiled);
            router.add("PUT", routePath, compiled);
          } else if (isHandlerByMethod(route.handler)) {
            for (const method of Object.keys(route.handler)) {
              router.add(method, routePath, compiled);
            }
          }
        }
        break;
      }
      case "handler": {
        const {
          pattern,
          fns,
          method
        } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const result = segmentToMiddlewares(segment);
        result.push(...fns);
        const compiled = compileMiddlewares(result, onError);
        const resPath = toRoutePath(mergePath(basePath, pattern, false));
        if (method === "ALL") {
          router.add("GET", resPath, compiled);
          router.add("DELETE", resPath, compiled);
          router.add("HEAD", resPath, compiled);
          router.add("OPTIONS", resPath, compiled);
          router.add("PATCH", resPath, compiled);
          router.add("POST", resPath, compiled);
          router.add("PUT", resPath, compiled);
        } else {
          router.add(method, resPath, compiled);
        }
        break;
      }
      case "fsRoute": {
        const items2 = cmd.getItems();
        const base = mergePath(basePath, cmd.pattern, true);
        applyCommandsInner(root2, router, items2, base, onError);
        break;
      }
      default:
        throw new Error(`Unknown command: ${JSON.stringify(cmd)}`);
    }
  }
}
function isFreshFile(mod, commandType) {
  if (mod === null || typeof mod !== "object") return false;
  return typeof mod.default === "function" || commandType === CommandType.Middleware && Array.isArray(mod.default) || typeof mod.config === "object" || typeof mod.handlers === "object" || typeof mod.handlers === "function" || typeof mod.handler === "object" || typeof mod.handler === "function";
}
function fsItemsToCommands(items2) {
  const commands = [];
  for (let i2 = 0; i2 < items2.length; i2++) {
    const item = items2[i2];
    const {
      filePath,
      type,
      mod: rawMod,
      pattern,
      routePattern
    } = item;
    switch (type) {
      case CommandType.Middleware: {
        if (isLazy(rawMod)) continue;
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        let middlewares = handlers2 ?? mod.default ?? null;
        if (middlewares === null) continue;
        if (isHandlerByMethod(middlewares)) {
          warnInvalidRoute(`Middleware does not support object handlers with GET, POST, etc. in ${filePath}`);
          continue;
        }
        if (!Array.isArray(middlewares)) {
          middlewares = [middlewares];
        }
        commands.push(newMiddlewareCmd(pattern, middlewares, true));
        continue;
      }
      case CommandType.Layout: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        if (handlers2 !== null) {
          warnInvalidRoute("Layout does not support handlers");
        }
        if (!mod.default) continue;
        commands.push(newLayoutCmd(pattern, mod.default, mod.config, true));
        continue;
      }
      case CommandType.Error: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        commands.push(newErrorCmd(pattern, {
          component: mod.default ?? void 0,
          config: mod.config ?? void 0,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }, true));
        continue;
      }
      case CommandType.NotFound: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        commands.push(newNotFoundCmd({
          config: mod.config,
          component: mod.default,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }));
        continue;
      }
      case CommandType.App: {
        const {
          mod
        } = validateFsMod(filePath, rawMod, type);
        if (mod.default === void 0) continue;
        commands.push(newAppCmd(mod.default));
        continue;
      }
      case CommandType.Route: {
        let normalized;
        let config2 = {};
        if (isLazy(rawMod)) {
          normalized = async () => {
            return await tracer.startActiveSpan("lazy-route", {
              attributes: {
                "fresh.route_name": rawMod.name ?? "anonymous"
              }
            }, async (span) => {
              try {
                const result = await rawMod();
                return normalizeRoute(filePath, result, routePattern, type);
              } catch (err) {
                recordSpanError(span, err);
                throw err;
              } finally {
                span.end();
              }
            });
          };
          config2.methods = item.overrideConfig?.methods ?? "ALL";
          config2.routeOverride = item.overrideConfig?.routeOverride ?? routePattern;
        } else {
          normalized = normalizeRoute(filePath, rawMod, routePattern, type);
          if (rawMod.config) {
            config2 = rawMod.config;
          }
        }
        commands.push(newRouteCmd(pattern, normalized, config2, false));
        continue;
      }
      case CommandType.Handler:
        throw new Error(`Not supported`);
      case CommandType.FsRoute:
        throw new Error(`Nested FsRoutes are not supported`);
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }
  return commands;
}
function warnInvalidRoute(message) {
  console.warn(`🍋 %c[WARNING] Unsupported route config: ${message}`, "color:rgb(251, 184, 0)");
}
function validateFsMod(filePath, mod, commandType) {
  if (!isFreshFile(mod, commandType)) {
    const hint = commandType === CommandType.Middleware ? `Middleware files must have a default export (function or array of functions).

  Example:
    export default define.middleware(async (ctx) => {
      return await ctx.next();
    });` : `Route files must export a default component, a "handler" or "handlers" export, or a "config" export.

  Example:
    export const handler = define.handlers({ GET(ctx) { ... } });
    export default define.page((props) => <h1>Hello</h1>);`;
    throw new Error(`Could not find relevant exports in: ${filePath}

${hint}`);
  }
  const handlers2 = mod.handlers ?? mod.handler ?? null;
  if (typeof handlers2 === "function" && handlers2.length > 1) {
    throw new Error(`Handlers must only have one argument but found more than one. Check the function signature in: ${filePath}`);
  }
  return {
    handlers: handlers2,
    mod
  };
}
function normalizeRoute(filePath, rawMod, routePattern, commandType) {
  const {
    handlers: handlers2,
    mod
  } = validateFsMod(filePath, rawMod, commandType);
  return {
    config: {
      ...mod.config,
      routeOverride: mod.config?.routeOverride ?? routePattern
    },
    // deno-lint-ignore no-explicit-any
    handler: handlers2 ?? void 0,
    component: mod.default,
    css: rawMod.css
  };
}
class MockBuildCache {
  #files;
  root = "";
  clientEntry = "";
  islandRegistry = /* @__PURE__ */ new Map();
  features = {
    errorOverlay: false
  };
  constructor(files2, mode) {
    this.features.errorOverlay = mode === "development";
    this.#files = files2;
  }
  getEntryAssets() {
    return [];
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#files);
  }
  readFile(_pathname) {
    return Promise.resolve(null);
  }
}
const DEFAULT_CONN_INFO = {
  localAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 8080
  },
  remoteAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 1234
  }
};
const defaultOptionsHandler = (methods) => {
  return () => Promise.resolve(new Response(null, {
    status: 204,
    headers: {
      Allow: methods.join(", ")
    }
  }));
};
const DEFAULT_ERROR_HANDLER = async (ctx) => {
  const {
    error
  } = ctx;
  if (error instanceof HttpError) {
    if (error.status >= 500) {
      console.error(error);
    }
    const message = error.message || STATUS_TEXT[error.status];
    return new Response(message, {
      status: error.status
    });
  }
  console.error(error);
  return new Response("Internal server error", {
    status: 500
  });
};
function createOnListen(basePath, options2) {
  return (params) => {
    const pathname = basePath + "/";
    const protocol = "key" in options2 && options2.key && options2.cert ? "https:" : "http:";
    let hostname = params.hostname;
    if (Deno.build.os === "windows" && (hostname === "0.0.0.0" || hostname === "::")) {
      hostname = "localhost";
    }
    hostname = hostname.startsWith("::") ? `[${hostname}]` : hostname;
    console.log();
    console.log(bgRgb8(rgb8(" 🍋 Fresh ready   ", 0), 121));
    const sep = options2.remoteAddress ? "" : "\n";
    const space = options2.remoteAddress ? " " : "";
    const localLabel = bold("Local:");
    const address = cyan(`${protocol}//${hostname}:${params.port}${pathname}`);
    const helper = hostname === "0.0.0.0" || hostname === "::" ? cyan(` (${protocol}//localhost:${params.port}${pathname})`) : "";
    console.log(`    ${localLabel}  ${space}${address}${helper}${sep}`);
    if (options2.remoteAddress) {
      const remoteLabel = bold("Remote:");
      const remoteAddress = cyan(options2.remoteAddress);
      console.log(`    ${remoteLabel}  ${remoteAddress}
`);
    }
  };
}
async function listenOnFreePort(options2, handler2) {
  let firstError = null;
  for (let port = 8e3; port < 8020; port++) {
    try {
      return await Deno.serve({
        ...options2,
        port
      }, handler2);
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse) {
        if (!firstError) firstError = err;
        continue;
      }
      throw err;
    }
  }
  throw firstError;
}
let setBuildCache;
const NOOP$1 = () => {
};
class App {
  constructor(config2 = {}) {
    __privateAdd(this, _getBuildCache, () => null);
    __privateAdd(this, _commands, []);
    __privateAdd(this, _onError, NOOP$1);
    /**
     * The final resolved Fresh configuration.
     */
    __publicField(this, "config");
    this.config = {
      root: ".",
      basePath: config2.basePath ?? "",
      mode: config2.mode ?? "production",
      trustProxy: config2.trustProxy ?? false
    };
  }
  use(pathOrMiddleware, ...middlewares) {
    let pattern;
    let fns;
    if (typeof pathOrMiddleware === "string") {
      pattern = pathOrMiddleware;
      fns = middlewares;
    } else {
      pattern = "*";
      middlewares.unshift(pathOrMiddleware);
      fns = middlewares;
    }
    __privateGet(this, _commands).push(newMiddlewareCmd(pattern, fns, true));
    return this;
  }
  /**
   * Set the app's 404 error handler. Can be a {@linkcode Route} or a {@linkcode Middleware}.
   */
  notFound(routeOrMiddleware) {
    __privateGet(this, _commands).push(newNotFoundCmd(routeOrMiddleware));
    return this;
  }
  onError(path, routeOrMiddleware) {
    __privateGet(this, _commands).push(newErrorCmd(path, routeOrMiddleware, true));
    return this;
  }
  appWrapper(component) {
    __privateGet(this, _commands).push(newAppCmd(component));
    return this;
  }
  layout(path, component, config2) {
    __privateGet(this, _commands).push(newLayoutCmd(path, component, config2, true));
    return this;
  }
  route(path, route, config2) {
    __privateGet(this, _commands).push(newRouteCmd(path, route, config2, true));
    return this;
  }
  /**
   * Add middlewares for GET requests at the specified path.
   */
  get(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("GET", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for POST requests at the specified path.
   */
  post(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("POST", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for PATCH requests at the specified path.
   */
  patch(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PATCH", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for PUT requests at the specified path.
   */
  put(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PUT", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for DELETE requests at the specified path.
   */
  delete(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("DELETE", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for HEAD requests at the specified path.
   */
  head(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("HEAD", path, middlewares, true));
    return this;
  }
  /**
   * Register a WebSocket endpoint at the specified path.
   *
   * ```ts
   * app.ws("/chat", {
   *   open(socket) { console.log("connected"); },
   *   message(socket, event) { socket.send(event.data); },
   * });
   * ```
   */
  ws(path, handlers2, options2) {
    return this.get(path, (ctx) => ctx.upgrade(handlers2, options2));
  }
  /**
   * Add middlewares for all HTTP verbs at the specified path.
   */
  all(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("ALL", path, middlewares, true));
    return this;
  }
  /**
   * Insert file routes collected in {@linkcode Builder} at this point.
   * @param pattern Append file routes at this pattern instead of the root
   * @returns
   */
  fsRoutes(pattern = "*") {
    __privateGet(this, _commands).push({
      type: CommandType.FsRoute,
      pattern,
      getItems: () => {
        const buildCache = __privateGet(this, _getBuildCache).call(this);
        if (buildCache === null) return [];
        return buildCache.getFsRoutes();
      },
      includeLastSegment: false
    });
    return this;
  }
  /**
   * Merge another {@linkcode App} instance into this app at the
   * specified path.
   */
  mountApp(path, app2) {
    for (let i2 = 0; i2 < __privateGet(app2, _commands).length; i2++) {
      const cmd = __privateGet(app2, _commands)[i2];
      if (cmd.type !== CommandType.App && cmd.type !== CommandType.NotFound) {
        let effectivePattern = cmd.pattern;
        if (app2.config.basePath) {
          effectivePattern = mergePath(app2.config.basePath, cmd.pattern, false);
        }
        const clone = {
          ...cmd,
          pattern: mergePath(path, effectivePattern, true),
          includeLastSegment: cmd.pattern === "/" || cmd.includeLastSegment
        };
        __privateGet(this, _commands).push(clone);
        continue;
      }
      __privateGet(this, _commands).push(cmd);
    }
    const self2 = this;
    __privateSet(app2, _getBuildCache, () => {
      var _a;
      return __privateGet(_a = self2, _getBuildCache).call(_a);
    });
    return this;
  }
  /**
   * Create handler function for `Deno.serve` or to be used in
   * testing.
   */
  handler() {
    let buildCache = __privateGet(this, _getBuildCache).call(this);
    if (buildCache === null) {
      if (this.config.mode === "production" && DENO_DEPLOYMENT_ID !== void 0) ;
      else {
        buildCache = new MockBuildCache([], this.config.mode);
      }
    }
    const router = new UrlPatternRouter();
    const {
      rootHandler
    } = applyCommands(router, __privateGet(this, _commands), this.config.basePath, __privateGet(this, _onError));
    const trustProxy = this.config.trustProxy;
    return async (req, conn = DEFAULT_CONN_INFO) => {
      const url = new URL(req.url);
      url.pathname = url.pathname.replace(/\/+/g, "/");
      if (trustProxy) {
        const proto = req.headers.get("x-forwarded-proto");
        if (proto) {
          url.protocol = proto + ":";
        }
        const host = req.headers.get("x-forwarded-host");
        if (host) {
          url.host = host;
        }
      }
      const method = req.method.toUpperCase();
      const matched = router.match(method, url);
      let {
        params,
        pattern,
        item: handler2,
        methodMatch
      } = matched;
      const span = _trace.getActiveSpan();
      if (span && pattern) {
        span.updateName(`${method} ${pattern}`);
        span.setAttribute("http.route", pattern);
      }
      let next;
      if (pattern === null || !methodMatch) {
        handler2 = rootHandler;
      }
      if (matched.pattern !== null && !methodMatch) {
        if (method === "OPTIONS") {
          const allowed = router.getAllowedMethods(matched.pattern);
          next = defaultOptionsHandler(allowed);
        } else {
          next = DEFAULT_NOT_ALLOWED_METHOD;
        }
      } else {
        next = DEFAULT_NOT_FOUND;
      }
      const ctx = new Context(req, url, conn, matched.pattern, params, this.config, next, buildCache);
      try {
        const result = await (handler2 !== null ? handler2(ctx) : next());
        if (!(result instanceof Response)) {
          throw new Error(`Expected a "Response" instance to be returned, but got: ${result}`);
        }
        if (method === "HEAD") {
          return new Response(null, result);
        }
        return result;
      } catch (err) {
        ctx.error = err;
        return await DEFAULT_ERROR_HANDLER(ctx);
      }
    };
  }
  /**
   * Spawn a server for this app.
   */
  async listen(options2 = {}) {
    if (!options2.onListen) {
      options2.onListen = createOnListen(this.config.basePath, options2);
    }
    const handler2 = this.handler();
    if (options2.port) {
      await Deno.serve(options2, handler2);
      return;
    }
    await listenOnFreePort(options2, handler2);
  }
}
_getBuildCache = new WeakMap();
_commands = new WeakMap();
_onError = new WeakMap();
setBuildCache = (app2, cache, mode) => {
  app2.config.root = cache.root;
  app2.config.mode = mode;
  __privateSet(app2, _getBuildCache, () => cache);
};
class ProdBuildCache {
  root;
  #snapshot;
  islandRegistry;
  clientEntry;
  features;
  constructor(root2, snapshot2) {
    this.root = root2;
    this.features = {
      errorOverlay: false
    };
    setBuildId(snapshot2.version);
    this.#snapshot = snapshot2;
    this.islandRegistry = snapshot2.islands;
    this.clientEntry = snapshot2.clientEntry;
  }
  getEntryAssets() {
    return this.#snapshot.entryAssets;
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#snapshot.fsRoutes);
  }
  async readFile(pathname) {
    const {
      staticFiles: staticFiles2
    } = this.#snapshot;
    const info = staticFiles2.get(pathname);
    if (info === void 0) return null;
    const filePath = isAbsolute(info.filePath) ? info.filePath : join(this.root, info.filePath);
    const [stat, file] = await Promise.all([Deno.stat(filePath), Deno.open(filePath)]);
    return {
      hash: info.hash,
      contentType: info.contentType,
      size: stat.size,
      readable: file.readable,
      close: () => file.close(),
      immutable: info.immutable
    };
  }
}
function normalizePathname(pathname) {
  return "/" + pathname.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}
function staticFiles$1() {
  return async function freshServeStaticFiles(ctx) {
    const {
      req,
      url,
      config: config2
    } = ctx;
    const buildCache = getBuildCache(ctx);
    if (buildCache === null) return await ctx.next();
    let pathname = url.pathname;
    if (config2.basePath) {
      pathname = pathname !== config2.basePath ? pathname.slice(config2.basePath.length) : "/";
    }
    try {
      pathname = normalizePathname(decodeURIComponent(pathname));
    } catch (_e) {
      if (!(_e instanceof URIError)) throw _e;
      return await ctx.next();
    }
    const startTime = performance.now() + performance.timeOrigin;
    const file = await buildCache.readFile(pathname);
    if (pathname === "/" || file === null) {
      if (pathname === "/favicon.ico") {
        return new Response(null, {
          status: 404
        });
      }
      return await ctx.next();
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      file.close();
      return new Response("Method Not Allowed", {
        status: 405
      });
    }
    const span = tracer.startSpan("static file", {
      attributes: {
        "fresh.span_type": "static_file"
      },
      startTime
    });
    try {
      const cacheKey = url.searchParams.get(ASSET_CACHE_BUST_KEY);
      if (cacheKey !== null && BUILD_ID !== cacheKey) {
        url.searchParams.delete(ASSET_CACHE_BUST_KEY);
        const location = url.pathname + url.search;
        file.close();
        span.setAttribute("fresh.cache", "invalid_bust_key");
        span.setAttribute("fresh.cache_key", cacheKey);
        return new Response(null, {
          status: 307,
          headers: {
            location
          }
        });
      }
      const etag = file.hash;
      const headers = new Headers({
        "Content-Type": file.contentType,
        vary: "If-None-Match"
      });
      if (ctx.config.mode !== "development") {
        const ifNoneMatch = req.headers.get("If-None-Match");
        if (ifNoneMatch !== null && (ifNoneMatch === etag || ifNoneMatch === `W/"${etag}"`)) {
          file.close();
          span.setAttribute("fresh.cache", "not_modified");
          return new Response(null, {
            status: 304,
            headers
          });
        } else if (etag !== null) {
          headers.set("Etag", `W/"${etag}"`);
        }
      }
      if (ctx.config.mode !== "development" && (BUILD_ID === cacheKey || url.pathname.startsWith(`${ctx.config.basePath}/_fresh/js/${BUILD_ID}/`) || file.immutable)) {
        span.setAttribute("fresh.cache", "immutable");
        headers.append("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        span.setAttribute("fresh.cache", "no_cache");
        headers.append("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      }
      headers.set("Content-Length", String(file.size));
      if (req.method === "HEAD") {
        file.close();
        return new Response(null, {
          status: 200,
          headers
        });
      }
      return new Response(file.readable, {
        headers
      });
    } finally {
      span.end();
    }
  };
}
function createDefine() {
  return {
    handlers(handlers2) {
      return handlers2;
    },
    page(render) {
      return render;
    },
    layout(render) {
      return render;
    },
    middleware(middleware) {
      return middleware;
    }
  };
}
const define = createDefine();
const _app = define.page(function App2({
  Component
}) {
  return u$5("html", {
    lang: "en",
    children: [u$5("head", {
      children: [u$5("meta", {
        charset: "utf-8"
      }), u$5("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }), u$5("title", {
        children: "Hi Editor"
      })]
    }), u$5("body", {
      children: u$5(Component, null)
    })]
  });
});
const routeCss$1 = ["__FRESH_CSS_PLACEHOLDER__"];
const css$1 = routeCss$1;
const config$1 = void 0;
const handler$1 = void 0;
const handlers$1 = void 0;
const _freshRoute____app = _app;
const fsRoute_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  config: config$1,
  css: css$1,
  default: _freshRoute____app,
  handler: handler$1,
  handlers: handlers$1
}, Symbol.toStringTag, { value: "Module" }));
function g$4(n2, t2) {
  for (var e2 in t2) n2[e2] = t2[e2];
  return n2;
}
function E$2(n2, t2) {
  for (var e2 in n2) if ("__source" !== e2 && !(e2 in t2)) return true;
  for (var r2 in t2) if ("__source" !== r2 && n2[r2] !== t2[r2]) return true;
  return false;
}
function C$3(n2, t2) {
  var e2 = t2(), r2 = d$4({
    t: {
      __: e2,
      u: t2
    }
  }), u2 = r2[0].t, o2 = r2[1];
  return _$3(function() {
    u2.__ = e2, u2.u = t2, R$2(u2) && o2({
      t: u2
    });
  }, [n2, e2, t2]), y$4(function() {
    return R$2(u2) && o2({
      t: u2
    }), n2(function() {
      R$2(u2) && o2({
        t: u2
      });
    });
  }, [n2]), e2;
}
function R$2(n2) {
  try {
    return !((t2 = n2.__) === (e2 = n2.u()) && (0 !== t2 || 1 / t2 == 1 / e2) || t2 != t2 && e2 != e2);
  } catch (n3) {
    return true;
  }
  var t2, e2;
}
function x$4(n2) {
  n2();
}
function w$4(n2) {
  return n2;
}
function k$4() {
  return [false, x$4];
}
var I$2 = _$3;
function M$2(n2, t2) {
  this.props = n2, this.context = t2;
}
function N$2(n2, e2) {
  function r2(n3) {
    var t2 = this.props.ref;
    return t2 != n3.ref && t2 && ("function" == typeof t2 ? t2(null) : t2.current = null), e2 ? !e2(this.props, n3) || t2 != n3.ref : E$2(this.props, n3);
  }
  function u2(e3) {
    return this.shouldComponentUpdate = r2, k$7(n2, e3);
  }
  return u2.displayName = "Memo(" + (n2.displayName || n2.name) + ")", u2.__f = u2.prototype.isReactComponent = true, u2.type = n2, u2;
}
(M$2.prototype = new C$6()).isPureReactComponent = true, M$2.prototype.shouldComponentUpdate = function(n2, t2) {
  return E$2(this.props, n2) || E$2(this.state, t2);
};
var T$3 = l$5.__b;
l$5.__b = function(n2) {
  n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), T$3 && T$3(n2);
};
var A$4 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.forward_ref") || 3911;
function D$3(n2) {
  function t2(t3) {
    var e2 = g$4({}, t3);
    return delete e2.ref, n2(e2, t3.ref || null);
  }
  return t2.$$typeof = A$4, t2.render = n2, t2.prototype.isReactComponent = t2.__f = true, t2.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t2;
}
var F$3 = function(n2, t2) {
  return null == n2 ? null : F$6(F$6(n2).map(t2));
}, L$2 = {
  map: F$3,
  forEach: F$3,
  count: function(n2) {
    return n2 ? F$6(n2).length : 0;
  },
  only: function(n2) {
    var t2 = F$6(n2);
    if (1 !== t2.length) throw "Children.only";
    return t2[0];
  },
  toArray: F$6
}, O$2 = l$5.__e;
l$5.__e = function(n2, t2, e2, r2) {
  if (n2.then) {
    for (var u2, o2 = t2; o2 = o2.__; ) if ((u2 = o2.__c) && u2.__c) return null == t2.__e && (t2.__e = e2.__e, t2.__k = e2.__k), u2.__c(n2, t2);
  }
  O$2(n2, t2, e2, r2);
};
var U$2 = l$5.unmount;
function V$2(n2, t2, e2) {
  return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
    "function" == typeof n3.__c && n3.__c();
  }), n2.__c.__H = null), null != (n2 = g$4({}, n2)).__c && (n2.__c.__P === e2 && (n2.__c.__P = t2), n2.__c.__e = true, n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
    return V$2(n3, t2, e2);
  })), n2;
}
function W$2(n2, t2, e2) {
  return n2 && e2 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
    return W$2(n3, t2, e2);
  }), n2.__c && n2.__c.__P === t2 && (n2.__e && e2.appendChild(n2.__e), n2.__c.__e = true, n2.__c.__P = e2)), n2;
}
function P$3() {
  this.__u = 0, this.o = null, this.__b = null;
}
function j$3(n2) {
  var t2 = n2.__ && n2.__.__c;
  return t2 && t2.__a && t2.__a(n2);
}
function z$4(n2) {
  var e2, r2, u2, o2 = null;
  function i2(i3) {
    if (e2 || (e2 = n2()).then(function(n3) {
      n3 && (o2 = n3.default || n3), u2 = true;
    }, function(n3) {
      r2 = n3, u2 = true;
    }), r2) throw r2;
    if (!u2) throw e2;
    return o2 ? k$7(o2, i3) : null;
  }
  return i2.displayName = "Lazy", i2.__f = true, i2;
}
function B$3() {
  this.i = null, this.l = null;
}
l$5.unmount = function(n2) {
  var t2 = n2.__c;
  t2 && (t2.__z = true), t2 && t2.__R && t2.__R(), t2 && 32 & n2.__u && (n2.type = null), U$2 && U$2(n2);
}, (P$3.prototype = new C$6()).__c = function(n2, t2) {
  var e2 = t2.__c, r2 = this;
  null == r2.o && (r2.o = []), r2.o.push(e2);
  var u2 = j$3(r2.__v), o2 = false, i2 = function() {
    o2 || r2.__z || (o2 = true, e2.__R = null, u2 ? u2(c2) : c2());
  };
  e2.__R = i2;
  var l2 = e2.__P;
  e2.__P = null;
  var c2 = function() {
    if (!--r2.__u) {
      if (r2.state.__a) {
        var n3 = r2.state.__a;
        r2.__v.__k[0] = W$2(n3, n3.__c.__P, n3.__c.__O);
      }
      var t3;
      for (r2.setState({
        __a: r2.__b = null
      }); t3 = r2.o.pop(); ) t3.__P = l2, t3.forceUpdate();
    }
  };
  r2.__u++ || 32 & t2.__u || r2.setState({
    __a: r2.__b = r2.__v.__k[0]
  }), n2.then(i2, i2);
}, P$3.prototype.componentWillUnmount = function() {
  this.o = [];
}, P$3.prototype.render = function(n2, e2) {
  if (this.__b) {
    if (this.__v.__k) {
      var r2 = document.createElement("div"), o2 = this.__v.__k[0].__c;
      this.__v.__k[0] = V$2(this.__b, r2, o2.__O = o2.__P);
    }
    this.__b = null;
  }
  var i2 = e2.__a && k$7(S$1, null, n2.fallback);
  return i2 && (i2.__u &= -33), [k$7(S$1, null, e2.__a ? null : n2.children), i2];
};
var H$2 = function(n2, t2, e2) {
  if (++e2[1] === e2[0] && n2.l.delete(t2), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.l.size)) for (e2 = n2.i; e2; ) {
    for (; e2.length > 3; ) e2.pop()();
    if (e2[1] < e2[0]) break;
    n2.i = e2 = e2[2];
  }
};
function Z$1(n2) {
  return this.getChildContext = function() {
    return n2.context;
  }, n2.children;
}
function Y$1(n2) {
  var e2 = this, r2 = n2.h;
  if (e2.componentWillUnmount = function() {
    R$4(null, e2.v), e2.v = null, e2.h = null;
  }, e2.h && e2.h !== r2 && e2.componentWillUnmount(), !e2.v) {
    for (var u2 = e2.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    e2.h = r2, e2.v = {
      nodeType: 1,
      parentNode: r2,
      childNodes: [],
      __k: {
        __m: u2.__m
      },
      contains: function() {
        return true;
      },
      namespaceURI: r2.namespaceURI,
      insertBefore: function(n3, t2) {
        this.childNodes.push(n3), e2.h.insertBefore(n3, t2);
      },
      removeChild: function(n3) {
        this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e2.h.removeChild(n3);
      }
    };
  }
  R$4(k$7(Z$1, {
    context: e2.context
  }, n2.__v), e2.v);
}
function $$2(n2, e2) {
  var r2 = k$7(Y$1, {
    __v: n2,
    h: e2
  });
  return r2.containerInfo = e2, r2;
}
(B$3.prototype = new C$6()).__a = function(n2) {
  var t2 = this, e2 = j$3(t2.__v), r2 = t2.l.get(n2);
  return r2[0]++, function(u2) {
    var o2 = function() {
      t2.props.revealOrder ? (r2.push(u2), H$2(t2, n2, r2)) : u2();
    };
    e2 ? e2(o2) : o2();
  };
}, B$3.prototype.render = function(n2) {
  this.i = null, this.l = /* @__PURE__ */ new Map();
  var t2 = F$6(n2.children);
  n2.revealOrder && "b" === n2.revealOrder[0] && t2.reverse();
  for (var e2 = t2.length; e2--; ) this.l.set(t2[e2], this.i = [1, 0, this.i]);
  return n2.children;
}, B$3.prototype.componentDidUpdate = B$3.prototype.componentDidMount = function() {
  var n2 = this;
  this.l.forEach(function(t2, e2) {
    H$2(n2, e2, t2);
  });
};
var q$4 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.element") || 60103, G$2 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, J$2 = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, K$2 = /[A-Z0-9]/g, Q$2 = "undefined" != typeof document, X$3 = function(n2) {
  return ("undefined" != typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n2);
};
function nn$1(n2, t2, e2) {
  return null == t2.__k && (t2.textContent = ""), R$4(n2, t2), "function" == typeof e2 && e2(), n2 ? n2.__c : null;
}
function tn$1(n2, t2, e2) {
  return U$4(n2, t2), "function" == typeof e2 && e2(), n2 ? n2.__c : null;
}
C$6.prototype.isReactComponent = true, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t2) {
  Object.defineProperty(C$6.prototype, t2, {
    configurable: true,
    get: function() {
      return this["UNSAFE_" + t2];
    },
    set: function(n2) {
      Object.defineProperty(this, t2, {
        configurable: true,
        writable: true,
        value: n2
      });
    }
  });
});
var en$1 = l$5.event;
l$5.event = function(n2) {
  return en$1 && (n2 = en$1(n2)), n2.persist = function() {
  }, n2.isPropagationStopped = function() {
    return this.cancelBubble;
  }, n2.isDefaultPrevented = function() {
    return this.defaultPrevented;
  }, n2.nativeEvent = n2;
};
var rn$1, un$1 = {
  configurable: true,
  get: function() {
    return this.class;
  }
}, on$1 = l$5.vnode;
l$5.vnode = function(n2) {
  "string" == typeof n2.type && (function(n3) {
    var t2 = n3.props, e2 = n3.type, u2 = {}, o2 = -1 == e2.indexOf("-");
    for (var i2 in t2) {
      var l2 = t2[i2];
      if (!("value" === i2 && "defaultValue" in t2 && null == l2 || Q$2 && "children" === i2 && "noscript" === e2 || "class" === i2 || "className" === i2)) {
        var c2 = i2.toLowerCase();
        "defaultValue" === i2 && "value" in t2 && null == t2.value ? i2 = "value" : "download" === i2 && true === l2 ? l2 = "" : "translate" === c2 && "no" === l2 ? l2 = false : "o" === c2[0] && "n" === c2[1] ? "ondoubleclick" === c2 ? i2 = "ondblclick" : "onchange" !== c2 || "input" !== e2 && "textarea" !== e2 || X$3(t2.type) ? "onfocus" === c2 ? i2 = "onfocusin" : "onblur" === c2 ? i2 = "onfocusout" : J$2.test(i2) && (i2 = c2) : c2 = i2 = "oninput" : o2 && G$2.test(i2) ? i2 = i2.replace(K$2, "-$&").toLowerCase() : null === l2 && (l2 = void 0), "oninput" === c2 && u2[i2 = c2] && (i2 = "oninputCapture"), u2[i2] = l2;
      }
    }
    "select" == e2 && (u2.multiple && Array.isArray(u2.value) && (u2.value = F$6(t2.children).forEach(function(n4) {
      n4.props.selected = -1 != u2.value.indexOf(n4.props.value);
    })), null != u2.defaultValue && (u2.value = F$6(t2.children).forEach(function(n4) {
      n4.props.selected = u2.multiple ? -1 != u2.defaultValue.indexOf(n4.props.value) : u2.defaultValue == n4.props.value;
    }))), t2.class && !t2.className ? (u2.class = t2.class, Object.defineProperty(u2, "className", un$1)) : t2.className && (u2.class = u2.className = t2.className), n3.props = u2;
  })(n2), n2.$$typeof = q$4, on$1 && on$1(n2);
};
var ln$1 = l$5.__r;
l$5.__r = function(n2) {
  ln$1 && ln$1(n2), rn$1 = n2.__c;
};
var cn$2 = l$5.diffed;
l$5.diffed = function(n2) {
  cn$2 && cn$2(n2);
  var t2 = n2.props, e2 = n2.__e;
  null != e2 && "textarea" === n2.type && "value" in t2 && t2.value !== e2.value && (e2.value = null == t2.value ? "" : t2.value), rn$1 = null;
};
var fn$1 = {
  ReactCurrentDispatcher: {
    current: {
      readContext: function(n2) {
        return rn$1.__n[n2.__c].props.value;
      },
      useCallback: q$6,
      useContext: x$6,
      useDebugValue: P$5,
      useDeferredValue: w$4,
      useEffect: y$4,
      useId: g$6,
      useImperativeHandle: F$5,
      useInsertionEffect: I$2,
      useLayoutEffect: _$3,
      useMemo: T$4,
      useReducer: h$4,
      useRef: A$6,
      useState: d$4,
      useSyncExternalStore: C$3,
      useTransition: k$4
    }
  }
};
function sn$1(n2) {
  return k$7.bind(null, n2);
}
function hn$1(n2) {
  return !!n2 && n2.$$typeof === q$4;
}
function vn$1(n2) {
  return hn$1(n2) && n2.type === S$1;
}
function dn$1(n2) {
  return !!n2 && "string" == typeof n2.displayName && 0 == n2.displayName.indexOf("Memo(");
}
function mn$1(n2) {
  return hn$1(n2) ? W$4.apply(null, arguments) : n2;
}
function pn$1(n2) {
  return !!n2.__k && (R$4(null, n2), true);
}
function yn$1(n2) {
  return n2 && (n2.base || 1 === n2.nodeType && n2) || null;
}
var _n$1 = function(n2, t2) {
  return n2(t2);
}, bn$1 = function(n2, t2) {
  var r2 = l$5.debounceRendering;
  l$5.debounceRendering = function(n3) {
    return n3();
  };
  var u2 = n2(t2);
  return l$5.debounceRendering = r2, u2;
}, Sn$1 = hn$1, gn$1 = {
  useState: d$4,
  useId: g$6,
  useReducer: h$4,
  useEffect: y$4,
  useLayoutEffect: _$3,
  useInsertionEffect: I$2,
  useTransition: k$4,
  useDeferredValue: w$4,
  useSyncExternalStore: C$3,
  startTransition: x$4,
  useRef: A$6,
  useImperativeHandle: F$5,
  useMemo: T$4,
  useCallback: q$6,
  useContext: x$6,
  useDebugValue: P$5,
  version: "18.3.1",
  Children: L$2,
  render: nn$1,
  hydrate: tn$1,
  unmountComponentAtNode: pn$1,
  createPortal: $$2,
  createElement: k$7,
  createContext: X$4,
  createFactory: sn$1,
  cloneElement: mn$1,
  createRef: M$4,
  Fragment: S$1,
  isValidElement: hn$1,
  isElement: Sn$1,
  isFragment: vn$1,
  isMemo: dn$1,
  findDOMNode: yn$1,
  Component: C$6,
  PureComponent: M$2,
  memo: N$2,
  forwardRef: D$3,
  flushSync: bn$1,
  unstable_batchedUpdates: _n$1,
  StrictMode: S$1,
  Suspense: P$3,
  SuspenseList: B$3,
  lazy: z$4,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: fn$1
};
const _mod$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Children: L$2,
  Component: C$6,
  Fragment: S$1,
  PureComponent: M$2,
  StrictMode: S$1,
  Suspense: P$3,
  SuspenseList: B$3,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: fn$1,
  cloneElement: mn$1,
  createContext: X$4,
  createElement: k$7,
  createFactory: sn$1,
  createPortal: $$2,
  createRef: M$4,
  default: gn$1,
  findDOMNode: yn$1,
  flushSync: bn$1,
  forwardRef: D$3,
  hydrate: tn$1,
  isElement: Sn$1,
  isFragment: vn$1,
  isMemo: dn$1,
  isValidElement: hn$1,
  lazy: z$4,
  memo: N$2,
  render: nn$1,
  startTransition: x$4,
  unmountComponentAtNode: pn$1,
  unstable_batchedUpdates: _n$1,
  useCallback: q$6,
  useContext: x$6,
  useDebugValue: P$5,
  useDeferredValue: w$4,
  useEffect: y$4,
  useId: g$6,
  useImperativeHandle: F$5,
  useInsertionEffect: I$2,
  useLayoutEffect: _$3,
  useMemo: T$4,
  useReducer: h$4,
  useRef: A$6,
  useState: d$4,
  useSyncExternalStore: C$3,
  useTransition: k$4
}, Symbol.toStringTag, { value: "Module" }));
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState2;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = {
    setState,
    getState,
    getInitialState,
    subscribe
  };
  const initialState2 = state = createState(setState, getState, api);
  return api;
};
const createStore$2 = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
var n$1, l$2, u$2, i$1, r$3, o$1, e$2, f$3, c$2, a$1, s$1, h$2, p$2, v$2, y$2, d$2 = {}, w$3 = [], _$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, g$3 = Array.isArray;
function m$2(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function b$2(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function k$3(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n$1.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return x$3(l2, e2, i2, r2, null);
}
function x$3(n2, t2, i2, r2, o2) {
  var e2 = {
    type: n2,
    props: t2,
    key: i2,
    ref: r2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: null == o2 ? ++u$2 : o2,
    __i: -1,
    __u: 0
  };
  return null == o2 && null != l$2.vnode && l$2.vnode(e2), e2;
}
function M$1() {
  return {
    current: null
  };
}
function S(n2) {
  return n2.children;
}
function C$2(n2, l2) {
  this.props = n2, this.context = l2;
}
function $$1(n2, l2) {
  if (null == l2) return n2.__ ? $$1(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? $$1(n2) : null;
}
function I$1(n2) {
  if (n2.__P && n2.__d) {
    var u2 = n2.__v, t2 = u2.__e, i2 = [], r2 = [], o2 = m$2({}, u2);
    o2.__v = u2.__v + 1, l$2.vnode && l$2.vnode(o2), q$3(n2.__P, o2, u2, n2.__n, n2.__P.namespaceURI, 32 & u2.__u ? [t2] : null, i2, null == t2 ? $$1(u2) : t2, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, D$2(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t2 && P$2(o2);
  }
}
function P$2(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l2) {
    if (null != l2 && null != l2.__e) return n2.__e = n2.__c.base = l2.__e;
  }), P$2(n2);
}
function A$3(n2) {
  (!n2.__d && (n2.__d = true) && i$1.push(n2) && !H$1.__r++ || r$3 != l$2.debounceRendering) && ((r$3 = l$2.debounceRendering) || o$1)(H$1);
}
function H$1() {
  try {
    for (var n2, l2 = 1; i$1.length; ) i$1.length > l2 && i$1.sort(e$2), n2 = i$1.shift(), l2 = i$1.length, I$1(n2);
  } finally {
    i$1.length = H$1.__r = 0;
  }
}
function L$1(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h2, p2, v2, y2, _2, g2, m2 = t2 && t2.__k || w$3, b2 = l2.length;
  for (f2 = T$2(u2, l2, m2, f2, b2), s2 = 0; s2 < b2; s2++) null != (p2 = u2.__k[s2]) && (h2 = -1 != p2.__i && m2[p2.__i] || d$2, p2.__i = s2, _2 = q$3(n2, p2, h2, i2, r2, o2, e2, f2, c2, a2), v2 = p2.__e, p2.ref && h2.ref != p2.ref && (h2.ref && J$1(h2.ref, null, p2), a2.push(p2.ref, p2.__c || v2, p2)), null == y2 && null != v2 && (y2 = v2), (g2 = !!(4 & p2.__u)) || h2.__k === p2.__k ? (f2 = j$2(p2, f2, n2, g2), g2 && h2.__e && (h2.__e = null)) : "function" == typeof p2.type && void 0 !== _2 ? f2 = _2 : v2 && (f2 = v2.nextSibling), p2.__u &= -7);
  return u2.__e = y2, f2;
}
function T$2(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, a2 = u2.length, s2 = a2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = x$3(null, o2, null, null, null) : g$3(o2) ? o2 = n2.__k[r2] = x$3(S, {
    children: o2
  }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = x$3(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h2, o2.__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = O$1(o2, u2, f2, s2)) && (s2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > a2 ? h2-- : i2 < a2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (s2) for (r2 = 0; r2 < a2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = $$1(e2)), K$1(e2, e2));
  return t2;
}
function j$2(n2, l2, u2, t2) {
  var i2, r2;
  if ("function" == typeof n2.type) {
    for (i2 = n2.__k, r2 = 0; i2 && r2 < i2.length; r2++) i2[r2] && (i2[r2].__ = n2, l2 = j$2(i2[r2], l2, u2, t2));
    return l2;
  }
  n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = $$1(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function F$2(n2, l2) {
  return l2 = l2 || [], null == n2 || "boolean" == typeof n2 || (g$3(n2) ? n2.some(function(n3) {
    F$2(n3, l2);
  }) : l2.push(n2)), l2;
}
function O$1(n2, l2, u2, t2) {
  var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], a2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == e2 || a2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (a2 ? 1 : 0)) {
    for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
  }
  return -1;
}
function z$3(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || _$1.test(l2) ? u2 : u2 + "px";
}
function N$1(n2, l2, u2, t2, i2) {
  var r2, o2;
  n: if ("style" == l2) {
    if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || z$3(n2.style, l2, "");
      if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || z$3(n2.style, l2, u2[l2]);
    }
  } else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(s$1, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2[a$1] = t2[a$1] : (u2[a$1] = h$2, n2.addEventListener(l2, r2 ? v$2 : p$2, r2)) : n2.removeEventListener(l2, r2 ? v$2 : p$2, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function V$1(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2[c$2]) u2[c$2] = h$2++;
      else if (u2[c$2] < t2[a$1]) return;
      return t2(l$2.event ? l$2.event(u2) : u2);
    }
  };
}
function q$3(n2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h2, p2, v2, y2, d2, _2, k2, x2, M2, $2, I2, P2, A2, H2, T2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (s2 = l$2.__b) && s2(u2);
  n: if ("function" == typeof T2) try {
    if (k2 = u2.props, x2 = T2.prototype && T2.prototype.render, M2 = (s2 = T2.contextType) && i2[s2.__c], $2 = s2 ? M2 ? M2.props.value : s2.__ : i2, t2.__c ? _2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (x2 ? u2.__c = h2 = new T2(k2, $2) : (u2.__c = h2 = new C$2(k2, $2), h2.constructor = T2, h2.render = Q$1), M2 && M2.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), x2 && null == h2.__s && (h2.__s = h2.state), x2 && null != T2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = m$2({}, h2.__s)), m$2(h2.__s, T2.getDerivedStateFromProps(k2, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) x2 && null == T2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), x2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (x2 && null == T2.getDerivedStateFromProps && k2 !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(k2, $2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(k2, h2.__s, $2)) {
        u2.__v != t2.__v && (h2.props = k2, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
          n3 && (n3.__ = u2);
        }), w$3.push.apply(h2.__h, h2._sb), h2._sb = [], h2.__h.length && e2.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(k2, h2.__s, $2), x2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(v2, y2, d2);
      });
    }
    if (h2.context = $2, h2.props = k2, h2.__P = n2, h2.__e = false, I2 = l$2.__r, P2 = 0, x2) h2.state = h2.__s, h2.__d = false, I2 && I2(u2), s2 = h2.render(h2.props, h2.state, h2.context), w$3.push.apply(h2.__h, h2._sb), h2._sb = [];
    else do {
      h2.__d = false, I2 && I2(u2), s2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++P2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i2 = m$2(m$2({}, i2), h2.getChildContext())), x2 && !p2 && null != h2.getSnapshotBeforeUpdate && (d2 = h2.getSnapshotBeforeUpdate(v2, y2)), A2 = null != s2 && s2.type === S && null == s2.key ? E$1(s2.props.children) : s2, f2 = L$1(n2, g$3(A2) ? A2 : [A2], u2, t2, i2, r2, o2, e2, f2, c2, a2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), _2 && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u2.__v = null, c2 || null != o2) {
      if (n3.then) {
        for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
        o2[o2.indexOf(f2)] = null, u2.__e = f2;
      } else {
        for (H2 = o2.length; H2--; ) b$2(o2[H2]);
        B$2(u2);
      }
    } else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || B$2(u2);
    l$2.__e(n3, u2, t2);
  }
  else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = G$1(t2.__e, u2, t2, i2, r2, o2, e2, c2, a2);
  return (s2 = l$2.diffed) && s2(u2), 128 & u2.__u ? void 0 : f2;
}
function B$2(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B$2));
}
function D$2(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) J$1(t2[i2], t2[++i2], t2[++i2]);
  l$2.__c && l$2.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$2.__e(n3, u3.__v);
    }
  });
}
function E$1(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g$3(n2) ? n2.map(E$1) : void 0 !== n2.constructor ? null : m$2({}, n2);
}
function G$1(u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h2, p2, v2, y2, w2, _2, m2 = i2.props || d$2, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (s2 = 0; s2 < e2.length; s2++) if ((y2 = e2[s2]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
      u2 = y2, e2[s2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$2.__m && l$2.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) m2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = "textarea" == x2 && null != k2.defaultValue ? null : e2 && n$1.call(u2.childNodes), !c2 && null != e2) for (m2 = {}, s2 = 0; s2 < u2.attributes.length; s2++) m2[(y2 = u2.attributes[s2]).name] = y2.value;
    for (s2 in m2) y2 = m2[s2], "dangerouslySetInnerHTML" == s2 ? p2 = y2 : "children" == s2 || s2 in k2 || "value" == s2 && "defaultValue" in k2 || "checked" == s2 && "defaultChecked" in k2 || N$1(u2, s2, null, y2, o2);
    for (s2 in k2) y2 = k2[s2], "children" == s2 ? v2 = y2 : "dangerouslySetInnerHTML" == s2 ? h2 = y2 : "value" == s2 ? w2 = y2 : "checked" == s2 ? _2 = y2 : c2 && "function" != typeof y2 || m2[s2] === y2 || N$1(u2, s2, y2, m2[s2], o2);
    if (h2) c2 || p2 && (h2.__html == p2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (p2 && (u2.innerHTML = ""), L$1("template" == t2.type ? u2.content : u2, g$3(v2) ? v2 : [v2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && $$1(i2, 0), c2, a2), null != e2) for (s2 = e2.length; s2--; ) b$2(e2[s2]);
    c2 && "textarea" != x2 || (s2 = "value", "progress" == x2 && null == w2 ? u2.removeAttribute("value") : null != w2 && (w2 !== u2[s2] || "progress" == x2 && !w2 || "option" == x2 && w2 != m2[s2]) && N$1(u2, s2, w2, m2[s2], o2), s2 = "checked", null != _2 && _2 != u2[s2] && N$1(u2, s2, _2, m2[s2], o2));
  }
  return u2;
}
function J$1(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$2.__e(n3, t2);
  }
}
function K$1(n2, u2, t2) {
  var i2, r2;
  if (l$2.unmount && l$2.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || J$1(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$2.__e(n3, u2);
    }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && K$1(i2[r2], u2, t2 || "function" != typeof n2.type);
  t2 || b$2(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function Q$1(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function R$1(u2, t2, i2) {
  var r2, o2, e2, f2;
  t2 == document && (t2 = document.documentElement), l$2.__ && l$2.__(u2, t2), o2 = (r2 = "function" == typeof i2) ? null : i2 && i2.__k || t2.__k, e2 = [], f2 = [], q$3(t2, u2 = (!r2 && i2 || t2).__k = k$3(S, null, [u2]), o2 || d$2, d$2, t2.namespaceURI, !r2 && i2 ? [i2] : o2 ? null : t2.firstChild ? n$1.call(t2.childNodes) : null, e2, !r2 && i2 ? i2 : o2 ? o2.__e : t2.firstChild, r2, f2), D$2(e2, u2, f2);
}
function U$1(n2, l2) {
  R$1(n2, l2, U$1);
}
function W$1(l2, u2, t2) {
  var i2, r2, o2, e2, f2 = m$2({}, l2.props);
  for (o2 in l2.type && l2.type.defaultProps && (e2 = l2.type.defaultProps), u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : f2[o2] = void 0 === u2[o2] && null != e2 ? e2[o2] : u2[o2];
  return arguments.length > 2 && (f2.children = arguments.length > 3 ? n$1.call(arguments, 2) : t2), x$3(l2.type, f2, i2 || l2.key, r2 || l2.ref, null);
}
function X$2(n2) {
  function l2(n3) {
    var u2, t2;
    return this.getChildContext || (u2 = /* @__PURE__ */ new Set(), (t2 = {})[l2.__c] = this, this.getChildContext = function() {
      return t2;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, A$3(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + y$2++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n$1 = w$3.slice, l$2 = {
  __e: function(n2, l2, u2, t2) {
    for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
    } catch (l3) {
      n2 = l3;
    }
    throw n2;
  }
}, u$2 = 0, C$2.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$2({}, this.state), "function" == typeof n2 && (n2 = n2(m$2({}, u2), this.props)), n2 && m$2(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), A$3(this));
}, C$2.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), A$3(this));
}, C$2.prototype.render = S, i$1 = [], o$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$2 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, H$1.__r = 0, f$3 = Math.random().toString(8), c$2 = "__d" + f$3, a$1 = "__a" + f$3, s$1 = /(PointerCapture)$|Capture$/i, h$2 = 0, p$2 = V$1(false), v$2 = V$1(true), y$2 = 0;
var t$1, r$2, u$1, i, o = 0, f$2 = [], c$1 = l$2, e$1 = c$1.__b, a = c$1.__r, v$1 = c$1.diffed, l$1 = c$1.__c, m$1 = c$1.unmount, s = c$1.__;
function p$1(n2, t2) {
  c$1.__h && c$1.__h(r$2, n2, o || t2), o = 0;
  var u2 = r$2.__H || (r$2.__H = {
    __: [],
    __h: []
  });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d$1(n2) {
  return o = 1, h$1(D$1, n2);
}
function h$1(n2, u2, i2) {
  var o2 = p$1(t$1++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [i2 ? i2(u2) : D$1(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r$2, !r$2.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      })) return !c2 || c2.call(this, n3, t2, r2);
      var i3 = o2.__c.props !== n3;
      return u3.some(function(n4) {
        if (n4.__N) {
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2 && c2.call(this, n3, t2, r2) || i3;
    };
    r$2.__f = true;
    var c2 = r$2.shouldComponentUpdate, e2 = r$2.componentWillUpdate;
    r$2.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r$2.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function y$1(n2, u2) {
  var i2 = p$1(t$1++, 3);
  !c$1.__s && C$1(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r$2.__H.__h.push(i2));
}
function _(n2, u2) {
  var i2 = p$1(t$1++, 4);
  !c$1.__s && C$1(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r$2.__h.push(i2));
}
function A$2(n2) {
  return o = 5, T$1(function() {
    return {
      current: n2
    };
  }, []);
}
function F$1(n2, t2, r2) {
  o = 6, _(function() {
    if ("function" == typeof n2) {
      var r3 = n2(t2());
      return function() {
        n2(null), r3 && "function" == typeof r3 && r3();
      };
    }
    if (n2) return n2.current = t2(), function() {
      return n2.current = null;
    };
  }, null == r2 ? r2 : r2.concat(n2));
}
function T$1(n2, r2) {
  var u2 = p$1(t$1++, 7);
  return C$1(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function q$2(n2, t2) {
  return o = 8, T$1(function() {
    return n2;
  }, t2);
}
function x$2(n2) {
  var u2 = r$2.context[n2.__c], i2 = p$1(t$1++, 9);
  return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r$2)), u2.props.value) : n2.__;
}
function P$1(n2, t2) {
  c$1.useDebugValue && c$1.useDebugValue(t2 ? t2(n2) : n2);
}
function b$1(n2) {
  var u2 = p$1(t$1++, 10), i2 = d$1();
  return u2.__ = n2, r$2.componentDidCatch || (r$2.componentDidCatch = function(n3, t2) {
    u2.__ && u2.__(n3, t2), i2[1](n3);
  }), [i2[0], function() {
    i2[1](void 0);
  }];
}
function g$2() {
  var n2 = p$1(t$1++, 11);
  if (!n2.__) {
    for (var u2 = r$2.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    var i2 = u2.__m || (u2.__m = [0, 0]);
    n2.__ = "P" + i2[0] + "-" + i2[1]++;
  }
  return n2.__;
}
function j$1() {
  for (var n2; n2 = f$2.shift(); ) {
    var t2 = n2.__H;
    if (n2.__P && t2) try {
      t2.__h.some(z$2), t2.__h.some(B$1), t2.__h = [];
    } catch (r2) {
      t2.__h = [], c$1.__e(r2, n2.__v);
    }
  }
}
c$1.__b = function(n2) {
  r$2 = null, e$1 && e$1(n2);
}, c$1.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s && s(n2, t2);
}, c$1.__r = function(n2) {
  a && a(n2), t$1 = 0;
  var i2 = (r$2 = n2.__c).__H;
  i2 && (u$1 === r$2 ? (i2.__h = [], r$2.__h = [], i2.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.some(z$2), i2.__h.some(B$1), i2.__h = [], t$1 = 0)), u$1 = r$2;
}, c$1.diffed = function(n2) {
  v$1 && v$1(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f$2.push(t2) && i === c$1.requestAnimationFrame || ((i = c$1.requestAnimationFrame) || w$2)(j$1)), t2.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u$1 = r$2 = null;
}, c$1.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.some(z$2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B$1(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c$1.__e(r2, n3.__v);
    }
  }), l$1 && l$1(n2, t2);
}, c$1.unmount = function(n2) {
  m$1 && m$1(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.some(function(n3) {
    try {
      z$2(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c$1.__e(t2, r2.__v));
};
var k$2 = "function" == typeof requestAnimationFrame;
function w$2(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k$2 && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k$2 && (t2 = requestAnimationFrame(r2));
}
function z$2(n2) {
  var t2 = r$2, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r$2 = t2;
}
function B$1(n2) {
  var t2 = r$2;
  n2.__c = n2.__(), r$2 = t2;
}
function C$1(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D$1(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
function g$1(n2, t2) {
  for (var e2 in t2) n2[e2] = t2[e2];
  return n2;
}
function E(n2, t2) {
  for (var e2 in n2) if ("__source" !== e2 && !(e2 in t2)) return true;
  for (var r2 in t2) if ("__source" !== r2 && n2[r2] !== t2[r2]) return true;
  return false;
}
function C(n2, t2) {
  var e2 = t2(), r2 = d$1({
    t: {
      __: e2,
      u: t2
    }
  }), u2 = r2[0].t, o2 = r2[1];
  return _(function() {
    u2.__ = e2, u2.u = t2, R(u2) && o2({
      t: u2
    });
  }, [n2, e2, t2]), y$1(function() {
    return R(u2) && o2({
      t: u2
    }), n2(function() {
      R(u2) && o2({
        t: u2
      });
    });
  }, [n2]), e2;
}
function R(n2) {
  try {
    return !((t2 = n2.__) === (e2 = n2.u()) && (0 !== t2 || 1 / t2 == 1 / e2) || t2 != t2 && e2 != e2);
  } catch (n3) {
    return true;
  }
  var t2, e2;
}
function x$1(n2) {
  n2();
}
function w$1(n2) {
  return n2;
}
function k$1() {
  return [false, x$1];
}
var I = _;
function M(n2, t2) {
  this.props = n2, this.context = t2;
}
function N(n2, e2) {
  function r2(n3) {
    var t2 = this.props.ref;
    return t2 != n3.ref && t2 && ("function" == typeof t2 ? t2(null) : t2.current = null), e2 ? !e2(this.props, n3) || t2 != n3.ref : E(this.props, n3);
  }
  function u2(e3) {
    return this.shouldComponentUpdate = r2, k$3(n2, e3);
  }
  return u2.displayName = "Memo(" + (n2.displayName || n2.name) + ")", u2.__f = u2.prototype.isReactComponent = true, u2.type = n2, u2;
}
(M.prototype = new C$2()).isPureReactComponent = true, M.prototype.shouldComponentUpdate = function(n2, t2) {
  return E(this.props, n2) || E(this.state, t2);
};
var T = l$2.__b;
l$2.__b = function(n2) {
  n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), T && T(n2);
};
var A$1 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.forward_ref") || 3911;
function D(n2) {
  function t2(t3) {
    var e2 = g$1({}, t3);
    return delete e2.ref, n2(e2, t3.ref || null);
  }
  return t2.$$typeof = A$1, t2.render = n2, t2.prototype.isReactComponent = t2.__f = true, t2.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t2;
}
var F = function(n2, t2) {
  return null == n2 ? null : F$2(F$2(n2).map(t2));
}, L = {
  map: F,
  forEach: F,
  count: function(n2) {
    return n2 ? F$2(n2).length : 0;
  },
  only: function(n2) {
    var t2 = F$2(n2);
    if (1 !== t2.length) throw "Children.only";
    return t2[0];
  },
  toArray: F$2
}, O = l$2.__e;
l$2.__e = function(n2, t2, e2, r2) {
  if (n2.then) {
    for (var u2, o2 = t2; o2 = o2.__; ) if ((u2 = o2.__c) && u2.__c) return null == t2.__e && (t2.__e = e2.__e, t2.__k = e2.__k), u2.__c(n2, t2);
  }
  O(n2, t2, e2, r2);
};
var U = l$2.unmount;
function V(n2, t2, e2) {
  return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
    "function" == typeof n3.__c && n3.__c();
  }), n2.__c.__H = null), null != (n2 = g$1({}, n2)).__c && (n2.__c.__P === e2 && (n2.__c.__P = t2), n2.__c.__e = true, n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
    return V(n3, t2, e2);
  })), n2;
}
function W(n2, t2, e2) {
  return n2 && e2 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
    return W(n3, t2, e2);
  }), n2.__c && n2.__c.__P === t2 && (n2.__e && e2.appendChild(n2.__e), n2.__c.__e = true, n2.__c.__P = e2)), n2;
}
function P() {
  this.__u = 0, this.o = null, this.__b = null;
}
function j(n2) {
  var t2 = n2.__ && n2.__.__c;
  return t2 && t2.__a && t2.__a(n2);
}
function z$1(n2) {
  var e2, r2, u2, o2 = null;
  function i2(i3) {
    if (e2 || (e2 = n2()).then(function(n3) {
      n3 && (o2 = n3.default || n3), u2 = true;
    }, function(n3) {
      r2 = n3, u2 = true;
    }), r2) throw r2;
    if (!u2) throw e2;
    return o2 ? k$3(o2, i3) : null;
  }
  return i2.displayName = "Lazy", i2.__f = true, i2;
}
function B() {
  this.i = null, this.l = null;
}
l$2.unmount = function(n2) {
  var t2 = n2.__c;
  t2 && (t2.__z = true), t2 && t2.__R && t2.__R(), t2 && 32 & n2.__u && (n2.type = null), U && U(n2);
}, (P.prototype = new C$2()).__c = function(n2, t2) {
  var e2 = t2.__c, r2 = this;
  null == r2.o && (r2.o = []), r2.o.push(e2);
  var u2 = j(r2.__v), o2 = false, i2 = function() {
    o2 || r2.__z || (o2 = true, e2.__R = null, u2 ? u2(c2) : c2());
  };
  e2.__R = i2;
  var l2 = e2.__P;
  e2.__P = null;
  var c2 = function() {
    if (!--r2.__u) {
      if (r2.state.__a) {
        var n3 = r2.state.__a;
        r2.__v.__k[0] = W(n3, n3.__c.__P, n3.__c.__O);
      }
      var t3;
      for (r2.setState({
        __a: r2.__b = null
      }); t3 = r2.o.pop(); ) t3.__P = l2, t3.forceUpdate();
    }
  };
  r2.__u++ || 32 & t2.__u || r2.setState({
    __a: r2.__b = r2.__v.__k[0]
  }), n2.then(i2, i2);
}, P.prototype.componentWillUnmount = function() {
  this.o = [];
}, P.prototype.render = function(n2, e2) {
  if (this.__b) {
    if (this.__v.__k) {
      var r2 = document.createElement("div"), o2 = this.__v.__k[0].__c;
      this.__v.__k[0] = V(this.__b, r2, o2.__O = o2.__P);
    }
    this.__b = null;
  }
  var i2 = e2.__a && k$3(S, null, n2.fallback);
  return i2 && (i2.__u &= -33), [k$3(S, null, e2.__a ? null : n2.children), i2];
};
var H = function(n2, t2, e2) {
  if (++e2[1] === e2[0] && n2.l.delete(t2), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.l.size)) for (e2 = n2.i; e2; ) {
    for (; e2.length > 3; ) e2.pop()();
    if (e2[1] < e2[0]) break;
    n2.i = e2 = e2[2];
  }
};
function Z(n2) {
  return this.getChildContext = function() {
    return n2.context;
  }, n2.children;
}
function Y(n2) {
  var e2 = this, r2 = n2.h;
  if (e2.componentWillUnmount = function() {
    R$1(null, e2.v), e2.v = null, e2.h = null;
  }, e2.h && e2.h !== r2 && e2.componentWillUnmount(), !e2.v) {
    for (var u2 = e2.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    e2.h = r2, e2.v = {
      nodeType: 1,
      parentNode: r2,
      childNodes: [],
      __k: {
        __m: u2.__m
      },
      contains: function() {
        return true;
      },
      namespaceURI: r2.namespaceURI,
      insertBefore: function(n3, t2) {
        this.childNodes.push(n3), e2.h.insertBefore(n3, t2);
      },
      removeChild: function(n3) {
        this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e2.h.removeChild(n3);
      }
    };
  }
  R$1(k$3(Z, {
    context: e2.context
  }, n2.__v), e2.v);
}
function $(n2, e2) {
  var r2 = k$3(Y, {
    __v: n2,
    h: e2
  });
  return r2.containerInfo = e2, r2;
}
(B.prototype = new C$2()).__a = function(n2) {
  var t2 = this, e2 = j(t2.__v), r2 = t2.l.get(n2);
  return r2[0]++, function(u2) {
    var o2 = function() {
      t2.props.revealOrder ? (r2.push(u2), H(t2, n2, r2)) : u2();
    };
    e2 ? e2(o2) : o2();
  };
}, B.prototype.render = function(n2) {
  this.i = null, this.l = /* @__PURE__ */ new Map();
  var t2 = F$2(n2.children);
  n2.revealOrder && "b" === n2.revealOrder[0] && t2.reverse();
  for (var e2 = t2.length; e2--; ) this.l.set(t2[e2], this.i = [1, 0, this.i]);
  return n2.children;
}, B.prototype.componentDidUpdate = B.prototype.componentDidMount = function() {
  var n2 = this;
  this.l.forEach(function(t2, e2) {
    H(n2, e2, t2);
  });
};
var q$1 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.element") || 60103, G = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, J = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, K = /[A-Z0-9]/g, Q = "undefined" != typeof document, X$1 = function(n2) {
  return ("undefined" != typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n2);
};
function nn(n2, t2, e2) {
  return null == t2.__k && (t2.textContent = ""), R$1(n2, t2), "function" == typeof e2 && e2(), n2 ? n2.__c : null;
}
function tn(n2, t2, e2) {
  return U$1(n2, t2), "function" == typeof e2 && e2(), n2 ? n2.__c : null;
}
C$2.prototype.isReactComponent = true, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t2) {
  Object.defineProperty(C$2.prototype, t2, {
    configurable: true,
    get: function() {
      return this["UNSAFE_" + t2];
    },
    set: function(n2) {
      Object.defineProperty(this, t2, {
        configurable: true,
        writable: true,
        value: n2
      });
    }
  });
});
var en = l$2.event;
l$2.event = function(n2) {
  return en && (n2 = en(n2)), n2.persist = function() {
  }, n2.isPropagationStopped = function() {
    return this.cancelBubble;
  }, n2.isDefaultPrevented = function() {
    return this.defaultPrevented;
  }, n2.nativeEvent = n2;
};
var rn, un = {
  configurable: true,
  get: function() {
    return this.class;
  }
}, on = l$2.vnode;
l$2.vnode = function(n2) {
  "string" == typeof n2.type && (function(n3) {
    var t2 = n3.props, e2 = n3.type, u2 = {}, o2 = -1 == e2.indexOf("-");
    for (var i2 in t2) {
      var l2 = t2[i2];
      if (!("value" === i2 && "defaultValue" in t2 && null == l2 || Q && "children" === i2 && "noscript" === e2 || "class" === i2 || "className" === i2)) {
        var c2 = i2.toLowerCase();
        "defaultValue" === i2 && "value" in t2 && null == t2.value ? i2 = "value" : "download" === i2 && true === l2 ? l2 = "" : "translate" === c2 && "no" === l2 ? l2 = false : "o" === c2[0] && "n" === c2[1] ? "ondoubleclick" === c2 ? i2 = "ondblclick" : "onchange" !== c2 || "input" !== e2 && "textarea" !== e2 || X$1(t2.type) ? "onfocus" === c2 ? i2 = "onfocusin" : "onblur" === c2 ? i2 = "onfocusout" : J.test(i2) && (i2 = c2) : c2 = i2 = "oninput" : o2 && G.test(i2) ? i2 = i2.replace(K, "-$&").toLowerCase() : null === l2 && (l2 = void 0), "oninput" === c2 && u2[i2 = c2] && (i2 = "oninputCapture"), u2[i2] = l2;
      }
    }
    "select" == e2 && (u2.multiple && Array.isArray(u2.value) && (u2.value = F$2(t2.children).forEach(function(n4) {
      n4.props.selected = -1 != u2.value.indexOf(n4.props.value);
    })), null != u2.defaultValue && (u2.value = F$2(t2.children).forEach(function(n4) {
      n4.props.selected = u2.multiple ? -1 != u2.defaultValue.indexOf(n4.props.value) : u2.defaultValue == n4.props.value;
    }))), t2.class && !t2.className ? (u2.class = t2.class, Object.defineProperty(u2, "className", un)) : t2.className && (u2.class = u2.className = t2.className), n3.props = u2;
  })(n2), n2.$$typeof = q$1, on && on(n2);
};
var ln = l$2.__r;
l$2.__r = function(n2) {
  ln && ln(n2), rn = n2.__c;
};
var cn$1 = l$2.diffed;
l$2.diffed = function(n2) {
  cn$1 && cn$1(n2);
  var t2 = n2.props, e2 = n2.__e;
  null != e2 && "textarea" === n2.type && "value" in t2 && t2.value !== e2.value && (e2.value = null == t2.value ? "" : t2.value), rn = null;
};
var fn = {
  ReactCurrentDispatcher: {
    current: {
      readContext: function(n2) {
        return rn.__n[n2.__c].props.value;
      },
      useCallback: q$2,
      useContext: x$2,
      useDebugValue: P$1,
      useDeferredValue: w$1,
      useEffect: y$1,
      useId: g$2,
      useImperativeHandle: F$1,
      useInsertionEffect: I,
      useLayoutEffect: _,
      useMemo: T$1,
      useReducer: h$1,
      useRef: A$2,
      useState: d$1,
      useSyncExternalStore: C,
      useTransition: k$1
    }
  }
}, an = "18.3.1";
function sn(n2) {
  return k$3.bind(null, n2);
}
function hn(n2) {
  return !!n2 && n2.$$typeof === q$1;
}
function vn(n2) {
  return hn(n2) && n2.type === S;
}
function dn(n2) {
  return !!n2 && "string" == typeof n2.displayName && 0 == n2.displayName.indexOf("Memo(");
}
function mn(n2) {
  return hn(n2) ? W$1.apply(null, arguments) : n2;
}
function pn(n2) {
  return !!n2.__k && (R$1(null, n2), true);
}
function yn(n2) {
  return n2 && (n2.base || 1 === n2.nodeType && n2) || null;
}
var _n = function(n2, t2) {
  return n2(t2);
}, bn = function(n2, t2) {
  var r2 = l$2.debounceRendering;
  l$2.debounceRendering = function(n3) {
    return n3();
  };
  var u2 = n2(t2);
  return l$2.debounceRendering = r2, u2;
}, Sn = hn, gn = {
  useState: d$1,
  useId: g$2,
  useReducer: h$1,
  useEffect: y$1,
  useLayoutEffect: _,
  useInsertionEffect: I,
  useTransition: k$1,
  useDeferredValue: w$1,
  useSyncExternalStore: C,
  startTransition: x$1,
  useRef: A$2,
  useImperativeHandle: F$1,
  useMemo: T$1,
  useCallback: q$2,
  useContext: x$2,
  useDebugValue: P$1,
  version: "18.3.1",
  Children: L,
  render: nn,
  hydrate: tn,
  unmountComponentAtNode: pn,
  createPortal: $,
  createElement: k$3,
  createContext: X$2,
  createFactory: sn,
  cloneElement: mn,
  createRef: M$1,
  Fragment: S,
  isValidElement: hn,
  isElement: Sn,
  isFragment: vn,
  isMemo: dn,
  findDOMNode: yn,
  Component: C$2,
  PureComponent: M,
  memo: N,
  forwardRef: D,
  flushSync: bn,
  unstable_batchedUpdates: _n,
  StrictMode: S,
  Suspense: P,
  SuspenseList: B,
  lazy: z$1,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: fn
};
const _mod$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Children: L,
  Component: C$2,
  Fragment: S,
  PureComponent: M,
  StrictMode: S,
  Suspense: P,
  SuspenseList: B,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: fn,
  cloneElement: mn,
  createContext: X$2,
  createElement: k$3,
  createFactory: sn,
  createPortal: $,
  createRef: M$1,
  default: gn,
  findDOMNode: yn,
  flushSync: bn,
  forwardRef: D,
  hydrate: tn,
  isElement: Sn,
  isFragment: vn,
  isMemo: dn,
  isValidElement: hn,
  lazy: z$1,
  memo: N,
  render: nn,
  startTransition: x$1,
  unmountComponentAtNode: pn,
  unstable_batchedUpdates: _n,
  useCallback: q$2,
  useContext: x$2,
  useDebugValue: P$1,
  useDeferredValue: w$1,
  useEffect: y$1,
  useErrorBoundary: b$1,
  useId: g$2,
  useImperativeHandle: F$1,
  useInsertionEffect: I,
  useLayoutEffect: _,
  useMemo: T$1,
  useReducer: h$1,
  useRef: A$2,
  useState: d$1,
  useSyncExternalStore: C,
  useTransition: k$1,
  version: an
}, Symbol.toStringTag, { value: "Module" }));
const identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = gn.useSyncExternalStore(api.subscribe, gn.useCallback(() => selector(api.getState()), [api, selector]), gn.useCallback(() => selector(api.getInitialState()), [api, selector]));
  gn.useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  const api = createStore$2(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createImpl;
const MAX_HISTORY = 50;
const createEditorSlice = (set, get2) => ({
  activeSiteId: null,
  activePageId: null,
  selectedElementId: null,
  hoveredElementId: null,
  viewport: "desktop",
  pages: [],
  dirtyPageIds: /* @__PURE__ */ new Set(),
  dirtyElementIds: /* @__PURE__ */ new Set(),
  elements: [],
  isDirty: false,
  isLoading: false,
  saveStatus: "idle",
  _history: [],
  _historyIndex: -1,
  setActiveSite: (id) => set({
    activeSiteId: id,
    activePageId: null,
    selectedElementId: null,
    _history: [],
    _historyIndex: -1
  }),
  setActivePage: (id) => set({
    activePageId: id,
    selectedElementId: null
  }),
  setViewport: (viewport) => set({
    viewport
  }),
  setPages: (pages) => set({
    pages,
    dirtyPageIds: /* @__PURE__ */ new Set()
  }),
  updatePageLocal: (id, updates) => set((s2) => ({
    pages: s2.pages.map((p2) => p2.id === id ? {
      ...p2,
      ...updates.slug !== void 0 ? {
        slug: updates.slug
      } : {},
      data: updates.data ? {
        ...p2.data,
        ...updates.data
      } : p2.data
    } : p2),
    dirtyPageIds: /* @__PURE__ */ new Set([...s2.dirtyPageIds, id]),
    isDirty: true
  })),
  setElements: (elements) => set({
    elements,
    dirtyElementIds: /* @__PURE__ */ new Set(),
    isDirty: false
  }),
  selectElement: (id) => set({
    selectedElementId: id
  }),
  setHoveredElement: (id) => set({
    hoveredElementId: id
  }),
  updateElement: (id, updates) => set((s2) => ({
    elements: s2.elements.map((e2) => e2.id === id ? {
      ...e2,
      ...updates
    } : e2),
    dirtyElementIds: /* @__PURE__ */ new Set([...s2.dirtyElementIds, id]),
    isDirty: true
  })),
  addElement: (element) => set((s2) => ({
    elements: [...s2.elements, element],
    dirtyElementIds: /* @__PURE__ */ new Set([...s2.dirtyElementIds, element.id]),
    isDirty: true
  })),
  removeElement: (id) => set((s2) => ({
    elements: s2.elements.filter((e2) => e2.id !== id && e2.parentId !== id),
    selectedElementId: s2.selectedElementId === id ? null : s2.selectedElementId,
    dirtyElementIds: new Set([...s2.dirtyElementIds].filter((d2) => d2 !== id)),
    isDirty: true
  })),
  insertElements: (newElements) => set((s2) => ({
    elements: [...s2.elements, ...newElements],
    dirtyElementIds: /* @__PURE__ */ new Set([...s2.dirtyElementIds, ...newElements.map((e2) => e2.id)]),
    isDirty: true
  })),
  reorderElement: (id, direction) => set((s2) => {
    const el = s2.elements.find((e2) => e2.id === id);
    if (!el) return s2;
    const siblings = s2.elements.filter((e2) => e2.parentId === el.parentId).sort((a2, b2) => a2.order - b2.order);
    const idx = siblings.findIndex((e2) => e2.id === id);
    if (idx < 0) return s2;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return s2;
    const swapEl = siblings[swapIdx];
    const updated = s2.elements.map((e2) => {
      if (e2.id === id) return {
        ...e2,
        order: swapEl.order
      };
      if (e2.id === swapEl.id) return {
        ...e2,
        order: el.order
      };
      return e2;
    });
    const prev = {
      elements: s2.elements,
      pages: s2.pages,
      selectedElementId: s2.selectedElementId
    };
    const newHistory = s2._historyIndex < s2._history.length - 1 ? s2._history.slice(0, s2._historyIndex + 1) : s2._history;
    return {
      elements: updated,
      isDirty: true,
      _history: [...newHistory, prev].slice(-MAX_HISTORY),
      _historyIndex: Math.min(newHistory.length, MAX_HISTORY - 1)
    };
  }),
  moveElement: (id, newParentId, index) => set((s2) => {
    const el = s2.elements.find((e2) => e2.id === id);
    if (!el) return s2;
    const prev = {
      elements: s2.elements,
      pages: s2.pages,
      selectedElementId: s2.selectedElementId
    };
    const newHistory = s2._historyIndex < s2._history.length - 1 ? s2._history.slice(0, s2._historyIndex + 1) : s2._history;
    const siblings = s2.elements.filter((e2) => e2.parentId === newParentId && e2.id !== id).sort((a2, b2) => a2.order - b2.order);
    const reordered = siblings.slice(0, index).concat([el, ...siblings.slice(index)]);
    const updated = s2.elements.map((e2) => {
      if (e2.id === id) return {
        ...e2,
        parentId: newParentId,
        order: index
      };
      const sibIdx = reordered.findIndex((r2) => r2.id === e2.id);
      if (sibIdx >= 0) return {
        ...e2,
        order: sibIdx
      };
      return e2;
    });
    return {
      elements: updated,
      isDirty: true,
      _history: [...newHistory, prev].slice(-MAX_HISTORY),
      _historyIndex: Math.min(newHistory.length, MAX_HISTORY - 1)
    };
  }),
  setDirty: (dirty) => set((s2) => ({
    isDirty: dirty,
    saveStatus: dirty ? "idle" : s2.saveStatus
  })),
  setLoading: (loading) => set({
    isLoading: loading
  }),
  setSaveStatus: (status) => set({
    saveStatus: status
  }),
  undo: () => set((s2) => {
    if (s2._historyIndex < 0) return s2;
    const entry = s2._history[s2._historyIndex];
    if (!entry) return s2;
    return {
      elements: entry.elements,
      pages: entry.pages,
      selectedElementId: entry.selectedElementId,
      isDirty: true,
      _historyIndex: s2._historyIndex - 1
    };
  }),
  redo: () => set((s2) => {
    const nextIndex = s2._historyIndex + 1;
    if (nextIndex >= s2._history.length) return s2;
    const entry = s2._history[nextIndex];
    if (!entry) return s2;
    return {
      elements: entry.elements,
      pages: entry.pages,
      selectedElementId: entry.selectedElementId,
      isDirty: true,
      _historyIndex: nextIndex
    };
  }),
  canUndo: () => get2()._historyIndex >= 0,
  canRedo: () => get2()._historyIndex + 1 < get2()._history.length
});
create()((...a2) => ({
  ...createEditorSlice(...a2)
}));
function r$1(e2) {
  var t2, f2, n2 = "";
  if ("string" == typeof e2 || "number" == typeof e2) n2 += e2;
  else if ("object" == typeof e2) if (Array.isArray(e2)) {
    var o2 = e2.length;
    for (t2 = 0; t2 < o2; t2++) e2[t2] && (f2 = r$1(e2[t2])) && (n2 && (n2 += " "), n2 += f2);
  } else for (f2 in e2) e2[f2] && (n2 && (n2 += " "), n2 += f2);
  return n2;
}
function clsx() {
  for (var e2, t2, f2 = 0, n2 = "", o2 = arguments.length; f2 < o2; f2++) (e2 = arguments[f2]) && (t2 = r$1(e2)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
const falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config2) => (props) => {
  var _config_compoundVariants;
  if ((config2 === null || config2 === void 0 ? void 0 : config2.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  const {
    variants,
    defaultVariants
  } = config2;
  const getVariantClassNames = Object.keys(variants).map((variant) => {
    const variantProp = props === null || props === void 0 ? void 0 : props[variant];
    const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
    if (variantProp === null) return null;
    const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
    return variants[variant][variantKey];
  });
  const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
    let [key, value] = param;
    if (value === void 0) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  const getCompoundVariantClassNames = config2 === null || config2 === void 0 ? void 0 : (_config_compoundVariants = config2.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
    let {
      class: cvClass,
      className: cvClassName,
      ...compoundVariantOptions
    } = param;
    return Object.entries(compoundVariantOptions).every((param2) => {
      let [key, value] = param2;
      return Array.isArray(value) ? value.includes({
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key]) : {
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key] === value;
    }) ? [...acc, cvClass, cvClassName] : acc;
  }, []);
  return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};
const concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i2 = 0; i2 < array1.length; i2++) {
    combinedArray[i2] = array1[i2];
  }
  for (let i2 = 0; i2 < array2.length; i2++) {
    combinedArray[array1.length + i2] = array2[i2];
  }
  return combinedArray;
};
const createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
const createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
const CLASS_PART_SEPARATOR = "-";
const EMPTY_CONFLICTS = [];
const ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
const createClassGroupUtils = (config2) => {
  const classMap = createClassMap(config2);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config2;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i2 = 0; i2 < validatorsLength; i2++) {
    const validatorObj = validators[i2];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
const getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
const createClassMap = (config2) => {
  const {
    theme,
    classGroups
  } = config2;
  return processClassGroups(classGroups, theme);
};
const processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i2 = 0; i2 < len; i2++) {
    const classDefinition = classGroup[i2];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
const processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
const processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
const processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
const processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i2 = 0; i2 < len; i2++) {
    const [key, value] = entries[i2];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
const getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i2 = 0; i2 < len; i2++) {
    const part = parts[i2];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
const isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
const createLruCache$1 = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update2 = (key, value) => {
    cache[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update2(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache) {
        cache[key] = value;
      } else {
        update2(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = "!";
const MODIFIER_SEPARATOR = ":";
const EMPTY_MODIFIERS = [];
const createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
const createParseClassName = (config2) => {
  const {
    prefix,
    experimentalParseClassName
  } = config2;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const createSortModifiers = (config2) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config2.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i2 = 0; i2 < modifiers.length; i2++) {
      const modifier = modifiers[i2];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
const createConfigUtils = (config2) => ({
  cache: createLruCache$1(config2.cacheSize),
  parseClassName: createParseClassName(config2),
  sortModifiers: createSortModifiers(config2),
  postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config2),
  ...createClassGroupUtils(config2)
});
const createPostfixLookupClassGroupIds = (config2) => {
  const lookup = /* @__PURE__ */ Object.create(null);
  const classGroupIds = config2.postfixLookupClassGroups;
  if (classGroupIds) {
    for (let i2 = 0; i2 < classGroupIds.length; i2++) {
      lookup[classGroupIds[i2]] = true;
    }
  }
  return lookup;
};
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers,
    postfixLookupClassGroupIds
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId;
    if (hasPostfixModifier) {
      const baseClassNameWithoutPostfix = baseClassName.substring(0, maybePostfixModifierPosition);
      classGroupId = getClassGroupId(baseClassNameWithoutPostfix);
      const classGroupIdWithPostfix = classGroupId && postfixLookupClassGroupIds[classGroupId] ? getClassGroupId(baseClassName) : void 0;
      if (classGroupIdWithPostfix && classGroupIdWithPostfix !== classGroupId) {
        classGroupId = classGroupIdWithPostfix;
        hasPostfixModifier = false;
      }
    } else {
      classGroupId = getClassGroupId(baseClassName);
    }
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i2 = 0; i2 < conflictGroups.length; ++i2) {
      const group = conflictGroups[i2];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
const twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k2 = 0; k2 < mix.length; k2++) {
    if (mix[k2]) {
      if (resolvedValue = toValue(mix[k2])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config2 = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config2);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
const fallbackThemeArr = [];
const fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = (value) => fractionRegex.test(value);
const isNumber = (value) => !!value && !Number.isNaN(Number(value));
const isInteger = (value) => !!value && Number.isInteger(Number(value));
const isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
const isTshirtSize = (value) => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
const isNever = () => false;
const isShadow = (value) => shadowRegex.test(value);
const isImage = (value) => imageRegex.test(value);
const isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isNamedContainerQuery = (value) => value.startsWith("@container") && (value[10] === "/" && value[11] !== void 0 || value[11] === "s" && value[16] !== void 0 && value.startsWith("-size/", 10) || value[11] === "n" && value[18] !== void 0 && value.startsWith("-normal/", 10));
const isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = (value) => arbitraryValueRegex.test(value);
const isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
const isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
const isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
const isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
const isLabelPosition = (label) => label === "position" || label === "percentage";
const isLabelImage = (label) => label === "image" || label === "url";
const isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
const isLabelLength = (label) => label === "length";
const isLabelNumber = (label) => label === "number";
const isLabelFamilyName = (label) => label === "family-name";
const isLabelWeight = (label) => label === "number" || label === "weight";
const isLabelShadow = (label) => label === "shadow";
const getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Container Type
       * @see https://tailwindcss.com/docs/responsive-design#container-queries
       */
      "container-type": [{
        "@container": ["", "normal", "size", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Container Name
       * @see https://tailwindcss.com/docs/responsive-design#named-containers
       */
      "container-named": [isNamedContainerQuery],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [isInteger, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      /**
       * Zoom
       * @see https://tailwindcss.com/docs/zoom
       */
      zoom: [{
        zoom: [isInteger, isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scrollbar Thumb Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-thumb-color": [{
        "scrollbar-thumb": scaleColor()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": scaleColor()
      }],
      /**
       * Scrollbar Gutter
       * @see https://tailwindcss.com/docs/scrollbar-gutter
       */
      "scrollbar-gutter": [{
        "scrollbar-gutter": ["auto", "stable", "both"]
      }],
      /**
       * Scrollbar Width
       * @see https://tailwindcss.com/docs/scrollbar-width
       */
      "scrollbar-w": [{
        scrollbar: ["auto", "thin", "none"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      "container-named": ["container-type"],
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    postfixLookupClassGroups: ["container-type"],
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
const twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]", {
  variants: {
    variant: {
      default: "bg-foreground text-background hover:bg-foreground/90 shadow-sm",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent/50 hover:text-accent-foreground",
      link: "text-foreground underline-offset-4 hover:underline"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-xl px-8",
      icon: "h-9 w-9 rounded-xl"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Button = /* @__PURE__ */ D$3(({
  className,
  variant,
  size: size2,
  ...props
}, ref) => {
  return /* @__PURE__ */ u$5("button", {
    className: cn(buttonVariants({
      variant,
      size: size2,
      className
    })),
    ref,
    ...props
  });
});
Button.displayName = "Button";
const Separator = /* @__PURE__ */ D$3(({
  className,
  orientation = "horizontal",
  ...props
}, ref) => /* @__PURE__ */ u$5("div", {
  ref,
  role: "separator",
  "aria-orientation": orientation,
  className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
  ...props
}));
Separator.displayName = "Separator";
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
const Icon = ({
  color = "currentColor",
  size: size2 = 24,
  strokeWidth = 2,
  absoluteStrokeWidth,
  children,
  iconNode,
  class: classes = "",
  ...rest
}) => k$3("svg", {
  ...defaultAttributes,
  width: String(size2),
  height: size2,
  stroke: color,
  ["stroke-width"]: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size2) : strokeWidth,
  class: ["lucide", classes].join(" "),
  ...rest
}, [...iconNode.map(([tag, attrs]) => k$3(tag, attrs)), ...F$2(children)]);
const createLucideIcon = (iconName, iconNode) => {
  const Component = ({
    class: classes = "",
    children,
    ...props
  }) => k$3(Icon, {
    ...props,
    iconNode,
    class: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${toKebabCase(iconName)}`, classes)
  }, children);
  Component.displayName = toPascalCase(iconName);
  return Component;
};
createLucideIcon("plus", [["path", {
  d: "M5 12h14",
  key: "1ays0h"
}], ["path", {
  d: "M12 5v14",
  key: "s699le"
}]]);
createLucideIcon("globe", [["circle", {
  cx: "12",
  cy: "12",
  r: "10",
  key: "1mglay"
}], ["path", {
  d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
  key: "13o1zl"
}], ["path", {
  d: "M2 12h20",
  key: "9i4pu4"
}]]);
createLucideIcon("trash-2", [["path", {
  d: "M3 6h18",
  key: "d0wm0j"
}], ["path", {
  d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
  key: "4alrt4"
}], ["path", {
  d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
  key: "v07s0e"
}], ["line", {
  x1: "10",
  x2: "10",
  y1: "11",
  y2: "17",
  key: "1uufr5"
}], ["line", {
  x1: "14",
  x2: "14",
  y1: "11",
  y2: "17",
  key: "xtxkd"
}]]);
createLucideIcon("file", [["path", {
  d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
  key: "1rqfz7"
}], ["path", {
  d: "M14 2v4a2 2 0 0 0 2 2h4",
  key: "tnqrlb"
}]]);
createLucideIcon("pencil", [["path", {
  d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
  key: "1a8usu"
}], ["path", {
  d: "m15 5 4 4",
  key: "1mk7zo"
}]]);
createLucideIcon("chevron-right", [["path", {
  d: "m9 18 6-6-6-6",
  key: "mthhwq"
}]]);
createLucideIcon("chevron-down", [["path", {
  d: "m6 9 6 6 6-6",
  key: "qrunsl"
}]]);
createLucideIcon("copy", [["rect", {
  width: "14",
  height: "14",
  x: "8",
  y: "8",
  rx: "2",
  ry: "2",
  key: "17jyea"
}], ["path", {
  d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
  key: "zix9uf"
}]]);
createLucideIcon("arrow-up", [["path", {
  d: "m5 12 7-7 7 7",
  key: "hav0vg"
}], ["path", {
  d: "M12 19V5",
  key: "x0mq9r"
}]]);
createLucideIcon("arrow-down", [["path", {
  d: "M12 5v14",
  key: "s699le"
}], ["path", {
  d: "m19 12-7 7-7-7",
  key: "1idqje"
}]]);
createLucideIcon("save", [["path", {
  d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  key: "1c8476"
}], ["path", {
  d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
  key: "1ydtos"
}], ["path", {
  d: "M7 3v4a1 1 0 0 0 1 1h7",
  key: "t51u73"
}]]);
createLucideIcon("undo-2", [["path", {
  d: "M9 14 4 9l5-5",
  key: "102s5s"
}], ["path", {
  d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11",
  key: "f3b9sd"
}]]);
createLucideIcon("redo-2", [["path", {
  d: "m15 14 5-5-5-5",
  key: "12vg1m"
}], ["path", {
  d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13",
  key: "6uklza"
}]]);
createLucideIcon("loader-circle", [["path", {
  d: "M21 12a9 9 0 1 1-6.219-8.56",
  key: "13zald"
}]]);
const Monitor = createLucideIcon("monitor", [["rect", {
  width: "20",
  height: "14",
  x: "2",
  y: "3",
  rx: "2",
  key: "48i651"
}], ["line", {
  x1: "8",
  x2: "16",
  y1: "21",
  y2: "21",
  key: "1svkeh"
}], ["line", {
  x1: "12",
  x2: "12",
  y1: "17",
  y2: "21",
  key: "vw1qmm"
}]]);
createLucideIcon("tablet-smartphone", [["rect", {
  width: "10",
  height: "14",
  x: "3",
  y: "8",
  rx: "2",
  key: "1vrsiq"
}], ["path", {
  d: "M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4",
  key: "1j4zmg"
}], ["path", {
  d: "M8 18h.01",
  key: "lrp35t"
}]]);
createLucideIcon("smartphone", [["rect", {
  width: "14",
  height: "20",
  x: "5",
  y: "2",
  rx: "2",
  ry: "2",
  key: "1yt0o3"
}], ["path", {
  d: "M12 18h.01",
  key: "mhygvu"
}]]);
createLucideIcon("check", [["path", {
  d: "M20 6 9 17l-5-5",
  key: "1gmf2c"
}]]);
const Code = createLucideIcon("code", [["polyline", {
  points: "16 18 22 12 16 6",
  key: "z7tu5w"
}], ["polyline", {
  points: "8 6 2 12 8 18",
  key: "1eg1df"
}]]);
const Columns3 = createLucideIcon("columns-3", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}], ["path", {
  d: "M9 3v18",
  key: "fh3hqa"
}], ["path", {
  d: "M15 3v18",
  key: "14nvp0"
}]]);
const Grid3x3 = createLucideIcon("grid-3x3", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}], ["path", {
  d: "M3 9h18",
  key: "1pudct"
}], ["path", {
  d: "M3 15h18",
  key: "5xshup"
}], ["path", {
  d: "M9 3v18",
  key: "fh3hqa"
}], ["path", {
  d: "M15 3v18",
  key: "14nvp0"
}]]);
const Heading = createLucideIcon("heading", [["path", {
  d: "M6 12h12",
  key: "8npq4p"
}], ["path", {
  d: "M6 20V4",
  key: "1w1bmo"
}], ["path", {
  d: "M18 20V4",
  key: "o2hl4u"
}]]);
const Image$1 = createLucideIcon("image", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  ry: "2",
  key: "1m3agn"
}], ["circle", {
  cx: "9",
  cy: "9",
  r: "2",
  key: "af1f0g"
}], ["path", {
  d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
  key: "1xmnt7"
}]]);
const LayoutDashboard = createLucideIcon("layout-dashboard", [["rect", {
  width: "7",
  height: "9",
  x: "3",
  y: "3",
  rx: "1",
  key: "10lvy0"
}], ["rect", {
  width: "7",
  height: "5",
  x: "14",
  y: "3",
  rx: "1",
  key: "16une8"
}], ["rect", {
  width: "7",
  height: "9",
  x: "14",
  y: "12",
  rx: "1",
  key: "1hutg5"
}], ["rect", {
  width: "7",
  height: "5",
  x: "3",
  y: "16",
  rx: "1",
  key: "ldoo1y"
}]]);
const Link = createLucideIcon("link", [["path", {
  d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
  key: "1cjeqo"
}], ["path", {
  d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  key: "19qd67"
}]]);
const Minus = createLucideIcon("minus", [["path", {
  d: "M5 12h14",
  key: "1ays0h"
}]]);
const MoveVertical = createLucideIcon("move-vertical", [["path", {
  d: "M12 2v20",
  key: "t6zp3m"
}], ["path", {
  d: "m8 18 4 4 4-4",
  key: "bh5tu3"
}], ["path", {
  d: "m8 6 4-4 4 4",
  key: "ybng9g"
}]]);
const Play = createLucideIcon("play", [["polygon", {
  points: "6 3 20 12 6 21 6 3",
  key: "1oa8hb"
}]]);
const Rows3 = createLucideIcon("rows-3", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}], ["path", {
  d: "M21 9H3",
  key: "1338ky"
}], ["path", {
  d: "M21 15H3",
  key: "9uk58r"
}]]);
const Square = createLucideIcon("square", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}]]);
const Type = createLucideIcon("type", [["polyline", {
  points: "4 7 4 4 20 4 20 7",
  key: "1nosan"
}], ["line", {
  x1: "9",
  x2: "15",
  y1: "20",
  y2: "20",
  key: "swin9y"
}], ["line", {
  x1: "12",
  x2: "12",
  y1: "4",
  y2: "20",
  key: "1tx1rr"
}]]);
const X = createLucideIcon("x", [["path", {
  d: "M18 6 6 18",
  key: "1bl5f8"
}], ["path", {
  d: "m6 6 12 12",
  key: "d8bk6v"
}]]);
createLucideIcon("layers", [["path", {
  d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
  key: "zw3jo"
}], ["path", {
  d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
  key: "1wduqc"
}], ["path", {
  d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
  key: "kqbvx6"
}]]);
const LayoutGrid = createLucideIcon("layout-grid", [["rect", {
  width: "7",
  height: "7",
  x: "3",
  y: "3",
  rx: "1",
  key: "1g98yp"
}], ["rect", {
  width: "7",
  height: "7",
  x: "14",
  y: "3",
  rx: "1",
  key: "6d4xhi"
}], ["rect", {
  width: "7",
  height: "7",
  x: "14",
  y: "14",
  rx: "1",
  key: "nxv5o0"
}], ["rect", {
  width: "7",
  height: "7",
  x: "3",
  y: "14",
  rx: "1",
  key: "1bb6yr"
}]]);
createLucideIcon("square-mouse-pointer", [["path", {
  d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z",
  key: "xwnzip"
}], ["path", {
  d: "M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6",
  key: "14rsvq"
}]]);
createLucideIcon("rectangle-horizontal", [["rect", {
  width: "20",
  height: "12",
  x: "2",
  y: "6",
  rx: "2",
  key: "9lu3g6"
}]]);
createLucideIcon("gallery-horizontal", [["path", {
  d: "M2 3v18",
  key: "pzttux"
}], ["rect", {
  width: "12",
  height: "18",
  x: "6",
  y: "3",
  rx: "2",
  key: "btr8bg"
}], ["path", {
  d: "M22 3v18",
  key: "6jf3v"
}]]);
createLucideIcon("gallery-horizontal-end", [["path", {
  d: "M2 7v10",
  key: "a2pl2d"
}], ["path", {
  d: "M6 5v14",
  key: "1kq3d7"
}], ["rect", {
  width: "12",
  height: "18",
  x: "10",
  y: "3",
  rx: "2",
  key: "13i7bc"
}]]);
createLucideIcon("gallery-vertical", [["path", {
  d: "M3 2h18",
  key: "15qxfx"
}], ["rect", {
  width: "18",
  height: "12",
  x: "3",
  y: "6",
  rx: "2",
  key: "1439r6"
}], ["path", {
  d: "M3 22h18",
  key: "8prr45"
}]]);
createLucideIcon("gallery-vertical-end", [["path", {
  d: "M7 2h10",
  key: "nczekb"
}], ["path", {
  d: "M5 6h14",
  key: "u2x4p"
}], ["rect", {
  width: "18",
  height: "12",
  x: "3",
  y: "10",
  rx: "2",
  key: "l0tzu3"
}]]);
createLucideIcon("grid-2x2", [["path", {
  d: "M12 3v18",
  key: "108xh3"
}], ["path", {
  d: "M3 12h18",
  key: "1i2n21"
}], ["rect", {
  x: "3",
  y: "3",
  width: "18",
  height: "18",
  rx: "2",
  key: "h1oib"
}]]);
createLucideIcon("eye-off", [["path", {
  d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
  key: "ct8e1f"
}], ["path", {
  d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
  key: "151rxh"
}], ["path", {
  d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
  key: "13bj9a"
}], ["path", {
  d: "m2 2 20 20",
  key: "1ooewy"
}]]);
createLucideIcon("eye", [["path", {
  d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
  key: "1nclc0"
}], ["circle", {
  cx: "12",
  cy: "12",
  r: "3",
  key: "1v7zrd"
}]]);
createLucideIcon("align-horizontal-justify-start", [["rect", {
  width: "6",
  height: "14",
  x: "6",
  y: "5",
  rx: "2",
  key: "hsirpf"
}], ["rect", {
  width: "6",
  height: "10",
  x: "16",
  y: "7",
  rx: "2",
  key: "13zkjt"
}], ["path", {
  d: "M2 2v20",
  key: "1ivd8o"
}]]);
createLucideIcon("align-horizontal-justify-end", [["rect", {
  width: "6",
  height: "14",
  x: "2",
  y: "5",
  rx: "2",
  key: "dy24zr"
}], ["rect", {
  width: "6",
  height: "10",
  x: "12",
  y: "7",
  rx: "2",
  key: "1ht384"
}], ["path", {
  d: "M22 2v20",
  key: "40qfg1"
}]]);
createLucideIcon("align-horizontal-justify-center", [["rect", {
  width: "6",
  height: "14",
  x: "2",
  y: "5",
  rx: "2",
  key: "dy24zr"
}], ["rect", {
  width: "6",
  height: "10",
  x: "16",
  y: "7",
  rx: "2",
  key: "13zkjt"
}], ["path", {
  d: "M12 2v20",
  key: "t6zp3m"
}]]);
createLucideIcon("align-horizontal-space-between", [["rect", {
  width: "6",
  height: "14",
  x: "3",
  y: "5",
  rx: "2",
  key: "j77dae"
}], ["rect", {
  width: "6",
  height: "10",
  x: "15",
  y: "7",
  rx: "2",
  key: "bq30hj"
}], ["path", {
  d: "M3 2v20",
  key: "1d2pfg"
}], ["path", {
  d: "M21 2v20",
  key: "p059bm"
}]]);
createLucideIcon("align-horizontal-space-around", [["rect", {
  width: "6",
  height: "10",
  x: "9",
  y: "7",
  rx: "2",
  key: "yn7j0q"
}], ["path", {
  d: "M4 22V2",
  key: "tsjzd3"
}], ["path", {
  d: "M20 22V2",
  key: "1bnhr8"
}]]);
createLucideIcon("align-horizontal-distribute-center", [["rect", {
  width: "6",
  height: "14",
  x: "4",
  y: "5",
  rx: "2",
  key: "1wwnby"
}], ["rect", {
  width: "6",
  height: "10",
  x: "14",
  y: "7",
  rx: "2",
  key: "1fe6j6"
}], ["path", {
  d: "M17 22v-5",
  key: "4b6g73"
}], ["path", {
  d: "M17 7V2",
  key: "hnrr36"
}], ["path", {
  d: "M7 22v-3",
  key: "1r4jpn"
}], ["path", {
  d: "M7 5V2",
  key: "liy1u9"
}]]);
createLucideIcon("align-vertical-justify-start", [["rect", {
  width: "14",
  height: "6",
  x: "5",
  y: "16",
  rx: "2",
  key: "1i8z2d"
}], ["rect", {
  width: "10",
  height: "6",
  x: "7",
  y: "6",
  rx: "2",
  key: "13squh"
}], ["path", {
  d: "M2 2h20",
  key: "1ennik"
}]]);
createLucideIcon("align-vertical-justify-end", [["rect", {
  width: "14",
  height: "6",
  x: "5",
  y: "12",
  rx: "2",
  key: "4l4tp2"
}], ["rect", {
  width: "10",
  height: "6",
  x: "7",
  y: "2",
  rx: "2",
  key: "ypihtt"
}], ["path", {
  d: "M2 22h20",
  key: "272qi7"
}]]);
createLucideIcon("align-vertical-justify-center", [["rect", {
  width: "14",
  height: "6",
  x: "5",
  y: "16",
  rx: "2",
  key: "1i8z2d"
}], ["rect", {
  width: "10",
  height: "6",
  x: "7",
  y: "2",
  rx: "2",
  key: "ypihtt"
}], ["path", {
  d: "M2 12h20",
  key: "9i4pu4"
}]]);
createLucideIcon("stretch-vertical", [["rect", {
  width: "6",
  height: "20",
  x: "4",
  y: "2",
  rx: "2",
  key: "19qu7m"
}], ["rect", {
  width: "6",
  height: "20",
  x: "14",
  y: "2",
  rx: "2",
  key: "24v0nk"
}]]);
createLucideIcon("baseline", [["path", {
  d: "M4 20h16",
  key: "14thso"
}], ["path", {
  d: "m6 16 6-12 6 12",
  key: "1b4byz"
}], ["path", {
  d: "M8 12h8",
  key: "1wcyev"
}]]);
createLucideIcon("wrap-text", [["line", {
  x1: "3",
  x2: "21",
  y1: "6",
  y2: "6",
  key: "4m8b97"
}], ["path", {
  d: "M3 12h15a3 3 0 1 1 0 6h-4",
  key: "1cl7v7"
}], ["polyline", {
  points: "16 16 14 18 16 20",
  key: "1jznyi"
}], ["line", {
  x1: "3",
  x2: "10",
  y1: "18",
  y2: "18",
  key: "1h33wv"
}]]);
createLucideIcon("arrow-right-left", [["path", {
  d: "m16 3 4 4-4 4",
  key: "1x1c3m"
}], ["path", {
  d: "M20 7H4",
  key: "zbl0bi"
}], ["path", {
  d: "m8 21-4-4 4-4",
  key: "h9nckh"
}], ["path", {
  d: "M4 17h16",
  key: "g4d7ey"
}]]);
createLucideIcon("align-left", [["path", {
  d: "M15 12H3",
  key: "6jk70r"
}], ["path", {
  d: "M17 18H3",
  key: "1amg6g"
}], ["path", {
  d: "M21 6H3",
  key: "1jwq7v"
}]]);
createLucideIcon("align-center", [["path", {
  d: "M17 12H7",
  key: "16if0g"
}], ["path", {
  d: "M19 18H5",
  key: "18s9l3"
}], ["path", {
  d: "M21 6H3",
  key: "1jwq7v"
}]]);
createLucideIcon("align-right", [["path", {
  d: "M21 12H9",
  key: "dn1m92"
}], ["path", {
  d: "M21 18H7",
  key: "1ygte8"
}], ["path", {
  d: "M21 6H3",
  key: "1jwq7v"
}]]);
createLucideIcon("align-justify", [["path", {
  d: "M3 12h18",
  key: "1i2n21"
}], ["path", {
  d: "M3 18h18",
  key: "1h113x"
}], ["path", {
  d: "M3 6h18",
  key: "d0wm0j"
}]]);
createLucideIcon("arrow-up-down", [["path", {
  d: "m21 16-4 4-4-4",
  key: "f6ql7i"
}], ["path", {
  d: "M17 20V4",
  key: "1ejh1v"
}], ["path", {
  d: "m3 8 4-4 4 4",
  key: "11wl7u"
}], ["path", {
  d: "M7 4v16",
  key: "1glfcx"
}]]);
createLucideIcon("scroll", [["path", {
  d: "M19 17V5a2 2 0 0 0-2-2H4",
  key: "zz82l3"
}], ["path", {
  d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
  key: "1ph1d7"
}]]);
createLucideIcon("panel-bottom-close", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}], ["path", {
  d: "M3 15h18",
  key: "5xshup"
}], ["path", {
  d: "m15 8-3 3-3-3",
  key: "1oxy1z"
}]]);
createLucideIcon("square-dashed", [["path", {
  d: "M5 3a2 2 0 0 0-2 2",
  key: "y57alp"
}], ["path", {
  d: "M19 3a2 2 0 0 1 2 2",
  key: "18rm91"
}], ["path", {
  d: "M21 19a2 2 0 0 1-2 2",
  key: "1j7049"
}], ["path", {
  d: "M5 21a2 2 0 0 1-2-2",
  key: "sbafld"
}], ["path", {
  d: "M9 3h1",
  key: "1yesri"
}], ["path", {
  d: "M9 21h1",
  key: "15o7lz"
}], ["path", {
  d: "M14 3h1",
  key: "1ec4yj"
}], ["path", {
  d: "M14 21h1",
  key: "v9vybs"
}], ["path", {
  d: "M3 9v1",
  key: "1r0deq"
}], ["path", {
  d: "M21 9v1",
  key: "mxsmne"
}], ["path", {
  d: "M3 14v1",
  key: "vnatye"
}], ["path", {
  d: "M21 14v1",
  key: "169vum"
}]]);
createLucideIcon("square-round-corner", [["path", {
  d: "M21 11a8 8 0 0 0-8-8",
  key: "1lxwo5"
}], ["path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
  key: "1dv2y5"
}]]);
createLucideIcon("circle", [["circle", {
  cx: "12",
  cy: "12",
  r: "10",
  key: "1mglay"
}]]);
createLucideIcon("maximize", [["path", {
  d: "M8 3H5a2 2 0 0 0-2 2v3",
  key: "1dcmit"
}], ["path", {
  d: "M21 8V5a2 2 0 0 0-2-2h-3",
  key: "1e4gt3"
}], ["path", {
  d: "M3 16v3a2 2 0 0 0 2 2h3",
  key: "wsl5sc"
}], ["path", {
  d: "M16 21h3a2 2 0 0 0 2-2v-3",
  key: "18trek"
}]]);
createLucideIcon("maximize-2", [["polyline", {
  points: "15 3 21 3 21 9",
  key: "mznyad"
}], ["polyline", {
  points: "9 21 3 21 3 15",
  key: "1avn1i"
}], ["line", {
  x1: "21",
  x2: "14",
  y1: "3",
  y2: "10",
  key: "ota7mn"
}], ["line", {
  x1: "3",
  x2: "10",
  y1: "21",
  y2: "14",
  key: "1atl0r"
}]]);
createLucideIcon("minimize-2", [["polyline", {
  points: "4 14 10 14 10 20",
  key: "11kfnr"
}], ["polyline", {
  points: "20 10 14 10 14 4",
  key: "rlmsce"
}], ["line", {
  x1: "14",
  x2: "21",
  y1: "10",
  y2: "3",
  key: "o5lafz"
}], ["line", {
  x1: "3",
  x2: "10",
  y1: "21",
  y2: "14",
  key: "1atl0r"
}]]);
const PanelTop = createLucideIcon("panel-top", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}], ["path", {
  d: "M3 9h18",
  key: "1pudct"
}]]);
const PanelBottom = createLucideIcon("panel-bottom", [["rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2",
  key: "afitv7"
}], ["path", {
  d: "M3 15h18",
  key: "5xshup"
}]]);
const Sparkles = createLucideIcon("sparkles", [["path", {
  d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  key: "4pj2yx"
}], ["path", {
  d: "M20 3v4",
  key: "1olli1"
}], ["path", {
  d: "M22 5h-4",
  key: "1gvqau"
}], ["path", {
  d: "M4 17v2",
  key: "vumght"
}], ["path", {
  d: "M5 18H3",
  key: "zchphs"
}]]);
const MousePointerClick = createLucideIcon("mouse-pointer-click", [["path", {
  d: "M14 4.1 12 6",
  key: "ita8i4"
}], ["path", {
  d: "m5.1 8-2.9-.8",
  key: "1go3kf"
}], ["path", {
  d: "m6 12-1.9 2",
  key: "mnht97"
}], ["path", {
  d: "M7.2 2.2 8 5.1",
  key: "1cfko1"
}], ["path", {
  d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
  key: "s0h3yz"
}]]);
createLucideIcon("spline", [["circle", {
  cx: "19",
  cy: "5",
  r: "2",
  key: "mhkx31"
}], ["circle", {
  cx: "5",
  cy: "19",
  r: "2",
  key: "v8kfzx"
}], ["path", {
  d: "M5 17A12 12 0 0 1 17 5",
  key: "1okkup"
}]]);
createLucideIcon("ellipsis", [["circle", {
  cx: "12",
  cy: "12",
  r: "1",
  key: "41hilf"
}], ["circle", {
  cx: "19",
  cy: "12",
  r: "1",
  key: "1wjl8i"
}], ["circle", {
  cx: "5",
  cy: "12",
  r: "1",
  key: "1pcz8c"
}]]);
createLucideIcon("equal", [["line", {
  x1: "5",
  x2: "19",
  y1: "9",
  y2: "9",
  key: "1nwqeh"
}], ["line", {
  x1: "5",
  x2: "19",
  y1: "15",
  y2: "15",
  key: "g8yjpy"
}]]);
createLucideIcon("slash", [["path", {
  d: "M22 2 2 22",
  key: "y4kqgn"
}]]);
var exports$a = {};
Object.defineProperty(exports$a, "__esModule", {
  value: true
});
var React$2 = gn$1 ?? _mod$6;
function is$2(x2, y2) {
  return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
}
var objectIs$2 = "function" === typeof Object.is ? Object.is : is$2, useState$1 = React$2.useState, useEffect$2 = React$2.useEffect, useLayoutEffect$1 = React$2.useLayoutEffect, useDebugValue$2 = React$2.useDebugValue;
function useSyncExternalStore$2$1(subscribe, getSnapshot) {
  var value = getSnapshot(), _useState = useState$1({
    inst: {
      value,
      getSnapshot
    }
  }), inst = _useState[0].inst, forceUpdate = _useState[1];
  useLayoutEffect$1(function() {
    inst.value = value;
    inst.getSnapshot = getSnapshot;
    checkIfSnapshotChanged$1(inst) && forceUpdate({
      inst
    });
  }, [subscribe, value, getSnapshot]);
  useEffect$2(function() {
    checkIfSnapshotChanged$1(inst) && forceUpdate({
      inst
    });
    return subscribe(function() {
      checkIfSnapshotChanged$1(inst) && forceUpdate({
        inst
      });
    });
  }, [subscribe]);
  useDebugValue$2(value);
  return value;
}
function checkIfSnapshotChanged$1(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs$2(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function useSyncExternalStore$1$1(subscribe, getSnapshot) {
  return getSnapshot();
}
var shim$2 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1$1 : useSyncExternalStore$2$1;
exports$a.useSyncExternalStore = void 0 !== React$2.useSyncExternalStore ? React$2.useSyncExternalStore : shim$2;
var _useSyncExternalStore$1 = exports$a.useSyncExternalStore;
var _default$6;
if (typeof exports$a === "object" && exports$a !== null && "default" in exports$a) {
  _default$6 = exports$a.default;
} else {
  _default$6 = exports$a;
}
const _default_default$5 = _default$6;
var __require$5 = exports$a;
const _mod$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$5,
  default: _default_default$5,
  useSyncExternalStore: _useSyncExternalStore$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$9 = {}, module$6 = {};
Object.defineProperty(module$6, "exports", {
  get() {
    return exports$9;
  },
  set(value) {
    exports$9 = value;
  }
});
Object.defineProperty(exports$9, "__esModule", {
  value: true
});
module$6.exports = _mod$4;
if (typeof exports$9 === "object" && exports$9 !== null && "default" in exports$9) {
  exports$9.default;
}
const TreeApiContext = X$4(null);
function useTreeApi() {
  const value = x$6(TreeApiContext);
  if (value === null) throw new Error("No Tree Api Provided");
  return value;
}
const NodesContext = X$4(null);
function useNodesContext() {
  const value = x$6(NodesContext);
  if (value === null) throw new Error("Provide a NodesContext");
  return value;
}
const DndContext$1 = X$4(null);
function useDndContext() {
  const value = x$6(DndContext$1);
  if (value === null) throw new Error("Provide a DnDContext");
  return value;
}
const DataUpdatesContext = X$4(0);
function useDataUpdates() {
  x$6(DataUpdatesContext);
}
function bound(n2, min, max) {
  return Math.max(Math.min(n2, max), min);
}
function isItem(node) {
  return node && node.isLeaf;
}
function isClosed(node) {
  return node && node.isInternal && !node.isOpen;
}
function isOpenWithEmptyChildren(node) {
  var _a;
  return node && node.isOpen && !((_a = node.children) === null || _a === void 0 ? void 0 : _a.length);
}
const isDescendant = (a2, b2) => {
  let n2 = a2;
  while (n2) {
    if (n2.id === b2.id) return true;
    n2 = n2.parent;
  }
  return false;
};
const indexOf = (node) => {
  if (!node.parent) throw Error("Node does not have a parent");
  return node.parent.children.findIndex((c2) => c2.id === node.id);
};
function dfs(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  if (node.children) {
    for (let child of node.children) {
      const result = dfs(child, id);
      if (result) return result;
    }
  }
  return null;
}
function walk(node, fn2) {
  fn2(node);
  if (node.children) {
    for (let child of node.children) {
      walk(child, fn2);
    }
  }
}
function focusNextElement(target) {
  const elements = getFocusable(target);
  let next;
  for (let i2 = 0; i2 < elements.length; ++i2) {
    const item = elements[i2];
    if (item === target) {
      next = nextItem(elements, i2);
      break;
    }
  }
  next === null || next === void 0 ? void 0 : next.focus();
}
function focusPrevElement(target) {
  const elements = getFocusable(target);
  let next;
  for (let i2 = 0; i2 < elements.length; ++i2) {
    const item = elements[i2];
    if (item === target) {
      next = prevItem(elements, i2);
      break;
    }
  }
  next === null || next === void 0 ? void 0 : next.focus();
}
function nextItem(list, index) {
  if (index + 1 < list.length) {
    return list[index + 1];
  } else {
    return list[0];
  }
}
function prevItem(list, index) {
  if (index - 1 >= 0) {
    return list[index - 1];
  } else {
    return list[list.length - 1];
  }
}
function getFocusable(target) {
  return Array.from(document.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)')).filter((e2) => e2 === target || !target.contains(e2));
}
function access(obj, accessor) {
  if (typeof accessor === "boolean") return accessor;
  if (typeof accessor === "string") return obj[accessor];
  return accessor(obj);
}
function identifyNull$1(obj) {
  if (obj === null) return null;
  else return identify$1(obj);
}
function identify$1(obj) {
  return typeof obj === "string" ? obj : obj.id;
}
function safeRun$1(fn2, ...args) {
  if (fn2) return fn2(...args);
}
function waitFor(fn2) {
  return new Promise((resolve2, reject) => {
    let tries = 0;
    function check() {
      tries += 1;
      if (tries === 100) reject();
      if (fn2()) resolve2();
      else setTimeout(check, 10);
    }
    check();
  });
}
function getInsertIndex(tree) {
  var _a, _b;
  const focus2 = tree.focusedNode;
  if (!focus2) return (_b = (_a = tree.root.children) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
  if (focus2.isOpen) return 0;
  if (focus2.parent) return focus2.childIndex + 1;
  return 0;
}
function getInsertParentId(tree) {
  const focus2 = tree.focusedNode;
  if (!focus2) return null;
  if (focus2.isOpen) return focus2.id;
  if (focus2.parent && !focus2.parent.isRoot) return focus2.parent.id;
  return null;
}
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  access,
  bound,
  dfs,
  focusNextElement,
  focusPrevElement,
  getInsertIndex,
  getInsertParentId,
  identify: identify$1,
  identifyNull: identifyNull$1,
  indexOf,
  isClosed,
  isDescendant,
  isItem,
  isOpenWithEmptyChildren,
  safeRun: safeRun$1,
  waitFor,
  walk
}, Symbol.toStringTag, { value: "Module" }));
const placeholderStyle = {
  display: "flex",
  alignItems: "center",
  zIndex: 1
};
const lineStyle = {
  flex: 1,
  height: "2px",
  background: "#4B91E2",
  borderRadius: "1px"
};
const circleStyle = {
  width: "4px",
  height: "4px",
  boxShadow: "0 0 0 3px #4B91E2",
  borderRadius: "50%"
};
const DefaultCursor = gn$1.memo(function DefaultCursor2({
  top,
  left,
  indent
}) {
  const style = {
    position: "absolute",
    pointerEvents: "none",
    top: top - 2 + "px",
    left: left + "px",
    right: indent + "px"
  };
  return u$5("div", {
    style: Object.assign(Object.assign({}, placeholderStyle), style),
    children: [u$5("div", {
      style: Object.assign({}, circleStyle)
    }), u$5("div", {
      style: Object.assign({}, lineStyle)
    })]
  });
});
function DefaultRow({
  node,
  attrs,
  innerRef,
  children
}) {
  return u$5("div", Object.assign({}, attrs, {
    ref: innerRef,
    onFocus: (e2) => e2.stopPropagation(),
    onClick: node.handleClick,
    children
  }));
}
function DefaultNode(props) {
  return u$5("div", {
    ref: props.dragHandle,
    style: props.style,
    children: [u$5("span", {
      onClick: (e2) => {
        e2.stopPropagation();
        props.node.toggle();
      },
      children: props.node.isLeaf ? "🌳" : props.node.isOpen ? "🗁" : "🗀"
    }), " ", props.node.isEditing ? u$5(Edit, Object.assign({}, props)) : u$5(Show, Object.assign({}, props))]
  });
}
function Show(props) {
  return u$5(S$1, {
    children: u$5("span", {
      children: props.node.data.name
    })
  });
}
function Edit({
  node
}) {
  const input = A$6();
  y$4(() => {
    var _a, _b;
    (_a = input.current) === null || _a === void 0 ? void 0 : _a.focus();
    (_b = input.current) === null || _b === void 0 ? void 0 : _b.select();
  }, []);
  return u$5("input", {
    ref: input,
    // @ts-ignore
    defaultValue: node.data.name,
    onBlur: () => node.reset(),
    onKeyDown: (e2) => {
      var _a;
      if (e2.key === "Escape") node.reset();
      if (e2.key === "Enter") node.submit(((_a = input.current) === null || _a === void 0 ? void 0 : _a.value) || "");
    }
  });
}
function edit(id) {
  return {
    type: "EDIT",
    id
  };
}
function reducer$5(state = {
  id: null
}, action) {
  if (action.type === "EDIT") {
    return Object.assign(Object.assign({}, state), {
      id: action.id
    });
  } else {
    return state;
  }
}
function focus(id) {
  return {
    type: "FOCUS",
    id
  };
}
function treeBlur() {
  return {
    type: "TREE_BLUR"
  };
}
function reducer$4(state = {
  id: null,
  treeFocused: false
}, action) {
  if (action.type === "FOCUS") {
    return Object.assign(Object.assign({}, state), {
      id: action.id,
      treeFocused: true
    });
  } else if (action.type === "TREE_BLUR") {
    return Object.assign(Object.assign({}, state), {
      treeFocused: false
    });
  } else {
    return state;
  }
}
class NodeApi {
  constructor(params) {
    this.handleClick = (e2) => {
      if (e2.metaKey && !this.tree.props.disableMultiSelection) {
        this.isSelected ? this.deselect() : this.selectMulti();
      } else if (e2.shiftKey && !this.tree.props.disableMultiSelection) {
        this.selectContiguous();
      } else {
        this.select();
        this.activate();
      }
    };
    this.tree = params.tree;
    this.id = params.id;
    this.data = params.data;
    this.level = params.level;
    this.children = params.children;
    this.parent = params.parent;
    this.isDraggable = params.isDraggable;
    this.rowIndex = params.rowIndex;
  }
  get isRoot() {
    return this.id === ROOT_ID;
  }
  get isLeaf() {
    return !Array.isArray(this.children);
  }
  get isInternal() {
    return !this.isLeaf;
  }
  get isOpen() {
    return this.isLeaf ? false : this.tree.isOpen(this.id);
  }
  get isClosed() {
    return this.isLeaf ? false : !this.tree.isOpen(this.id);
  }
  get isEditable() {
    return this.tree.isEditable(this.data);
  }
  get isSelectable() {
    return this.tree.isSelectable(this.data);
  }
  get isEditing() {
    return this.tree.editingId === this.id;
  }
  get isSelected() {
    return this.tree.isSelected(this.id);
  }
  get isOnlySelection() {
    return this.isSelected && this.tree.hasOneSelection;
  }
  get isSelectedStart() {
    var _a;
    return this.isSelected && !((_a = this.prev) === null || _a === void 0 ? void 0 : _a.isSelected);
  }
  get isSelectedEnd() {
    var _a;
    return this.isSelected && !((_a = this.next) === null || _a === void 0 ? void 0 : _a.isSelected);
  }
  get isFocused() {
    return this.tree.isFocused(this.id);
  }
  get isDragging() {
    return this.tree.isDragging(this.id);
  }
  get willReceiveDrop() {
    return this.tree.willReceiveDrop(this.id);
  }
  get state() {
    return {
      isClosed: this.isClosed,
      isDragging: this.isDragging,
      isEditing: this.isEditing,
      isFocused: this.isFocused,
      isInternal: this.isInternal,
      isLeaf: this.isLeaf,
      isOpen: this.isOpen,
      isSelected: this.isSelected,
      isSelectedEnd: this.isSelectedEnd,
      isSelectedStart: this.isSelectedStart,
      willReceiveDrop: this.willReceiveDrop
    };
  }
  get childIndex() {
    if (this.parent && this.parent.children) {
      return this.parent.children.findIndex((child) => child.id === this.id);
    } else {
      return -1;
    }
  }
  get next() {
    if (this.rowIndex === null) return null;
    return this.tree.at(this.rowIndex + 1);
  }
  get prev() {
    if (this.rowIndex === null) return null;
    return this.tree.at(this.rowIndex - 1);
  }
  get nextSibling() {
    var _a, _b;
    const i2 = this.childIndex;
    return (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.children[i2 + 1]) !== null && _b !== void 0 ? _b : null;
  }
  isAncestorOf(node) {
    if (!node) return false;
    let ancestor = node;
    while (ancestor) {
      if (ancestor.id === this.id) return true;
      ancestor = ancestor.parent;
    }
    return false;
  }
  select() {
    this.tree.select(this);
  }
  deselect() {
    this.tree.deselect(this);
  }
  selectMulti() {
    this.tree.selectMulti(this);
  }
  selectContiguous() {
    this.tree.selectContiguous(this);
  }
  activate() {
    this.tree.activate(this);
  }
  focus() {
    this.tree.focus(this);
  }
  toggle() {
    this.tree.toggle(this);
  }
  open() {
    this.tree.open(this);
  }
  openParents() {
    this.tree.openParents(this);
  }
  close() {
    this.tree.close(this);
  }
  submit(value) {
    this.tree.submit(this, value);
  }
  reset() {
    this.tree.reset();
  }
  clone() {
    return new NodeApi(Object.assign({}, this));
  }
  edit() {
    return this.tree.edit(this);
  }
}
const ROOT_ID = "__REACT_ARBORIST_INTERNAL_ROOT__";
function createRoot$1(tree) {
  var _a;
  function visitSelfAndChildren(data2, level, parent) {
    const id = tree.accessId(data2);
    const node = new NodeApi({
      tree,
      data: data2,
      level,
      parent,
      id,
      children: null,
      isDraggable: tree.isDraggable(data2),
      rowIndex: null
    });
    const children = tree.accessChildren(data2);
    if (children) {
      node.children = children.map((child) => visitSelfAndChildren(child, level + 1, node));
    }
    return node;
  }
  const root2 = new NodeApi({
    tree,
    id: ROOT_ID,
    // @ts-ignore
    data: {
      id: ROOT_ID
    },
    level: -1,
    parent: null,
    children: null,
    isDraggable: true,
    rowIndex: null
  });
  const data = (_a = tree.props.data) !== null && _a !== void 0 ? _a : [];
  root2.children = data.map((child) => {
    return visitSelfAndChildren(child, 0, root2);
  });
  return root2;
}
const actions$2 = {
  open(id, filtered) {
    return {
      type: "VISIBILITY_OPEN",
      id,
      filtered
    };
  },
  close(id, filtered) {
    return {
      type: "VISIBILITY_CLOSE",
      id,
      filtered
    };
  },
  toggle(id, filtered) {
    return {
      type: "VISIBILITY_TOGGLE",
      id,
      filtered
    };
  },
  clear(filtered) {
    return {
      type: "VISIBILITY_CLEAR",
      filtered
    };
  }
};
function openMapReducer(state = {}, action) {
  if (action.type === "VISIBILITY_OPEN") {
    return Object.assign(Object.assign({}, state), {
      [action.id]: true
    });
  } else if (action.type === "VISIBILITY_CLOSE") {
    return Object.assign(Object.assign({}, state), {
      [action.id]: false
    });
  } else if (action.type === "VISIBILITY_TOGGLE") {
    const prev = state[action.id];
    return Object.assign(Object.assign({}, state), {
      [action.id]: !prev
    });
  } else if (action.type === "VISIBILITY_CLEAR") {
    return {};
  } else {
    return state;
  }
}
function reducer$3(state = {
  filtered: {},
  unfiltered: {}
}, action) {
  if (!action.type.startsWith("VISIBILITY")) return state;
  if (action.filtered) {
    return Object.assign(Object.assign({}, state), {
      filtered: openMapReducer(state.filtered, action)
    });
  } else {
    return Object.assign(Object.assign({}, state), {
      unfiltered: openMapReducer(state.unfiltered, action)
    });
  }
}
const initialState$2 = (props) => {
  var _a;
  return {
    nodes: {
      // Changes together
      open: {
        filtered: {},
        unfiltered: (_a = props === null || props === void 0 ? void 0 : props.initialOpenState) !== null && _a !== void 0 ? _a : {}
      },
      focus: {
        id: null,
        treeFocused: false
      },
      edit: {
        id: null
      },
      drag: {
        id: null,
        selectedIds: [],
        destinationParentId: null,
        destinationIndex: null
      },
      selection: {
        ids: /* @__PURE__ */ new Set(),
        anchor: null,
        mostRecent: null
      }
    },
    dnd: {
      cursor: {
        type: "none"
      },
      dragId: null,
      dragIds: [],
      parentId: null,
      index: -1
    }
  };
};
const actions$1 = {
  clear: () => ({
    type: "SELECTION_CLEAR"
  }),
  only: (id) => ({
    type: "SELECTION_ONLY",
    id: identify$1(id)
  }),
  add: (id) => ({
    type: "SELECTION_ADD",
    ids: (Array.isArray(id) ? id : [id]).map(identify$1)
  }),
  remove: (id) => ({
    type: "SELECTION_REMOVE",
    ids: (Array.isArray(id) ? id : [id]).map(identify$1)
  }),
  set: (args) => Object.assign({
    type: "SELECTION_SET"
  }, args),
  mostRecent: (id) => ({
    type: "SELECTION_MOST_RECENT",
    id: id === null ? null : identify$1(id)
  }),
  anchor: (id) => ({
    type: "SELECTION_ANCHOR",
    id: id === null ? null : identify$1(id)
  })
};
function reducer$2(state = initialState$2()["nodes"]["selection"], action) {
  const ids = state.ids;
  switch (action.type) {
    case "SELECTION_CLEAR":
      return Object.assign(Object.assign({}, state), {
        ids: /* @__PURE__ */ new Set()
      });
    case "SELECTION_ONLY":
      return Object.assign(Object.assign({}, state), {
        ids: /* @__PURE__ */ new Set([action.id])
      });
    case "SELECTION_ADD":
      if (action.ids.length === 0) return state;
      action.ids.forEach((id) => ids.add(id));
      return Object.assign(Object.assign({}, state), {
        ids: new Set(ids)
      });
    case "SELECTION_REMOVE":
      if (action.ids.length === 0) return state;
      action.ids.forEach((id) => ids.delete(id));
      return Object.assign(Object.assign({}, state), {
        ids: new Set(ids)
      });
    case "SELECTION_SET":
      return Object.assign(Object.assign({}, state), {
        ids: action.ids,
        mostRecent: action.mostRecent,
        anchor: action.anchor
      });
    case "SELECTION_MOST_RECENT":
      return Object.assign(Object.assign({}, state), {
        mostRecent: action.id
      });
    case "SELECTION_ANCHOR":
      return Object.assign(Object.assign({}, state), {
        anchor: action.id
      });
    default:
      return state;
  }
}
const actions = {
  cursor(cursor) {
    return {
      type: "DND_CURSOR",
      cursor
    };
  },
  dragStart(id, dragIds) {
    return {
      type: "DND_DRAG_START",
      id,
      dragIds
    };
  },
  dragEnd() {
    return {
      type: "DND_DRAG_END"
    };
  },
  hovering(parentId, index) {
    return {
      type: "DND_HOVERING",
      parentId,
      index
    };
  }
};
function reducer$1(state = initialState$2()["dnd"], action) {
  switch (action.type) {
    case "DND_CURSOR":
      return Object.assign(Object.assign({}, state), {
        cursor: action.cursor
      });
    case "DND_DRAG_START":
      return Object.assign(Object.assign({}, state), {
        dragId: action.id,
        dragIds: action.dragIds
      });
    case "DND_DRAG_END":
      return initialState$2()["dnd"];
    case "DND_HOVERING":
      return Object.assign(Object.assign({}, state), {
        parentId: action.parentId,
        index: action.index
      });
    default:
      return state;
  }
}
const layerStyles = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%"
};
const getStyle = (offset) => {
  if (!offset) return {
    display: "none"
  };
  const {
    x: x2,
    y: y2
  } = offset;
  return {
    transform: `translate(${x2}px, ${y2}px)`
  };
};
const getCountStyle = (offset) => {
  if (!offset) return {
    display: "none"
  };
  const {
    x: x2,
    y: y2
  } = offset;
  return {
    transform: `translate(${x2 + 10}px, ${y2 + 10}px)`
  };
};
function DefaultDragPreview({
  offset,
  mouse,
  id,
  dragIds,
  isDragging
}) {
  return u$5(Overlay, {
    isDragging,
    children: [u$5(Position, {
      offset,
      children: u$5(PreviewNode, {
        id,
        dragIds
      })
    }), u$5(Count, {
      mouse,
      count: dragIds.length
    })]
  });
}
const Overlay = N$2(function Overlay2(props) {
  if (!props.isDragging) return null;
  return u$5("div", {
    style: layerStyles,
    children: props.children
  });
});
function Position(props) {
  return u$5("div", {
    className: "row preview",
    style: getStyle(props.offset),
    children: props.children
  });
}
function Count(props) {
  const {
    count,
    mouse
  } = props;
  if (count > 1) return u$5("div", {
    className: "selected-count",
    style: getCountStyle(mouse),
    children: count
  });
  else return null;
}
const PreviewNode = N$2(function PreviewNode2(props) {
  const tree = useTreeApi();
  const node = tree.get(props.id);
  if (!node) return null;
  return u$5(tree.renderNode, {
    preview: true,
    node,
    style: {
      paddingLeft: node.level * tree.indent,
      opacity: 0.2,
      background: "transparent"
    },
    tree
  });
});
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var t2 = arguments[e2];
      for (var r2 in t2) ({}).hasOwnProperty.call(t2, r2) && (n2[r2] = t2[r2]);
    }
    return n2;
  }, _extends.apply(null, arguments);
}
function _assertThisInitialized(e2) {
  if (void 0 === e2) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e2;
}
function _setPrototypeOf(t2, e2) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t3, e3) {
    return t3.__proto__ = e3, t3;
  }, _setPrototypeOf(t2, e2);
}
function _inheritsLoose(t2, o2) {
  t2.prototype = Object.create(o2.prototype), t2.prototype.constructor = t2, _setPrototypeOf(t2, o2);
}
var safeIsNaN = Number.isNaN || function ponyfill(value) {
  return typeof value === "number" && value !== value;
};
function isEqual(first, second) {
  if (first === second) {
    return true;
  }
  if (safeIsNaN(first) && safeIsNaN(second)) {
    return true;
  }
  return false;
}
function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  for (var i2 = 0; i2 < newInputs.length; i2++) {
    if (!isEqual(newInputs[i2], lastInputs[i2])) {
      return false;
    }
  }
  return true;
}
function memoizeOne(resultFn, isEqual2) {
  if (isEqual2 === void 0) {
    isEqual2 = areInputsEqual;
  }
  var lastThis;
  var lastArgs = [];
  var lastResult;
  var calledOnce = false;
  function memoized() {
    var newArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      newArgs[_i] = arguments[_i];
    }
    if (calledOnce && lastThis === this && isEqual2(newArgs, lastArgs)) {
      return lastResult;
    }
    lastResult = resultFn.apply(this, newArgs);
    calledOnce = true;
    lastThis = this;
    lastArgs = newArgs;
    return lastResult;
  }
  return memoized;
}
var hasNativePerformanceNow = typeof performance === "object" && typeof performance.now === "function";
var now = hasNativePerformanceNow ? function() {
  return performance.now();
} : function() {
  return Date.now();
};
function cancelTimeout(timeoutID) {
  cancelAnimationFrame(timeoutID.id);
}
function requestTimeout(callback, delay) {
  var start = now();
  function tick() {
    if (now() - start >= delay) {
      callback.call(null);
    } else {
      timeoutID.id = requestAnimationFrame(tick);
    }
  }
  var timeoutID = {
    id: requestAnimationFrame(tick)
  };
  return timeoutID;
}
var size = -1;
function getScrollbarSize(recalculate) {
  if (recalculate === void 0) {
    recalculate = false;
  }
  if (size === -1 || recalculate) {
    var div = document.createElement("div");
    var style = div.style;
    style.width = "50px";
    style.height = "50px";
    style.overflow = "scroll";
    document.body.appendChild(div);
    size = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
  }
  return size;
}
var cachedRTLResult = null;
function getRTLOffsetType(recalculate) {
  if (recalculate === void 0) {
    recalculate = false;
  }
  if (cachedRTLResult === null || recalculate) {
    var outerDiv = document.createElement("div");
    var outerStyle = outerDiv.style;
    outerStyle.width = "50px";
    outerStyle.height = "50px";
    outerStyle.overflow = "scroll";
    outerStyle.direction = "rtl";
    var innerDiv = document.createElement("div");
    var innerStyle = innerDiv.style;
    innerStyle.width = "100px";
    innerStyle.height = "100px";
    outerDiv.appendChild(innerDiv);
    document.body.appendChild(outerDiv);
    if (outerDiv.scrollLeft > 0) {
      cachedRTLResult = "positive-descending";
    } else {
      outerDiv.scrollLeft = 1;
      if (outerDiv.scrollLeft === 0) {
        cachedRTLResult = "negative";
      } else {
        cachedRTLResult = "positive-ascending";
      }
    }
    document.body.removeChild(outerDiv);
    return cachedRTLResult;
  }
  return cachedRTLResult;
}
var IS_SCROLLING_DEBOUNCE_INTERVAL$1 = 150;
var defaultItemKey$1 = function defaultItemKey(index, data) {
  return index;
};
function createListComponent(_ref) {
  var _class;
  var getItemOffset2 = _ref.getItemOffset, getEstimatedTotalSize2 = _ref.getEstimatedTotalSize, getItemSize2 = _ref.getItemSize, getOffsetForIndexAndAlignment2 = _ref.getOffsetForIndexAndAlignment, getStartIndexForOffset2 = _ref.getStartIndexForOffset, getStopIndexForStartIndex2 = _ref.getStopIndexForStartIndex, initInstanceProps2 = _ref.initInstanceProps, shouldResetStyleCacheOnItemSizeChange = _ref.shouldResetStyleCacheOnItemSizeChange, validateProps2 = _ref.validateProps;
  return _class = /* @__PURE__ */ (function(_PureComponent) {
    _inheritsLoose(List, _PureComponent);
    function List(props) {
      var _this;
      _this = _PureComponent.call(this, props) || this;
      _this._instanceProps = initInstanceProps2(_this.props, _assertThisInitialized(_this));
      _this._outerRef = void 0;
      _this._resetIsScrollingTimeoutId = null;
      _this.state = {
        instance: _assertThisInitialized(_this),
        isScrolling: false,
        scrollDirection: "forward",
        scrollOffset: typeof _this.props.initialScrollOffset === "number" ? _this.props.initialScrollOffset : 0,
        scrollUpdateWasRequested: false
      };
      _this._callOnItemsRendered = void 0;
      _this._callOnItemsRendered = memoizeOne(function(overscanStartIndex, overscanStopIndex, visibleStartIndex, visibleStopIndex) {
        return _this.props.onItemsRendered({
          overscanStartIndex,
          overscanStopIndex,
          visibleStartIndex,
          visibleStopIndex
        });
      });
      _this._callOnScroll = void 0;
      _this._callOnScroll = memoizeOne(function(scrollDirection, scrollOffset, scrollUpdateWasRequested) {
        return _this.props.onScroll({
          scrollDirection,
          scrollOffset,
          scrollUpdateWasRequested
        });
      });
      _this._getItemStyle = void 0;
      _this._getItemStyle = function(index) {
        var _this$props = _this.props, direction = _this$props.direction, itemSize = _this$props.itemSize, layout = _this$props.layout;
        var itemStyleCache = _this._getItemStyleCache(shouldResetStyleCacheOnItemSizeChange && itemSize, shouldResetStyleCacheOnItemSizeChange && layout, shouldResetStyleCacheOnItemSizeChange && direction);
        var style;
        if (itemStyleCache.hasOwnProperty(index)) {
          style = itemStyleCache[index];
        } else {
          var _offset = getItemOffset2(_this.props, index, _this._instanceProps);
          var size2 = getItemSize2(_this.props, index, _this._instanceProps);
          var isHorizontal = direction === "horizontal" || layout === "horizontal";
          var isRtl = direction === "rtl";
          var offsetHorizontal = isHorizontal ? _offset : 0;
          itemStyleCache[index] = style = {
            position: "absolute",
            left: isRtl ? void 0 : offsetHorizontal,
            right: isRtl ? offsetHorizontal : void 0,
            top: !isHorizontal ? _offset : 0,
            height: !isHorizontal ? size2 : "100%",
            width: isHorizontal ? size2 : "100%"
          };
        }
        return style;
      };
      _this._getItemStyleCache = void 0;
      _this._getItemStyleCache = memoizeOne(function(_2, __, ___) {
        return {};
      });
      _this._onScrollHorizontal = function(event) {
        var _event$currentTarget = event.currentTarget, clientWidth = _event$currentTarget.clientWidth, scrollLeft = _event$currentTarget.scrollLeft, scrollWidth = _event$currentTarget.scrollWidth;
        _this.setState(function(prevState) {
          if (prevState.scrollOffset === scrollLeft) {
            return null;
          }
          var direction = _this.props.direction;
          var scrollOffset = scrollLeft;
          if (direction === "rtl") {
            switch (getRTLOffsetType()) {
              case "negative":
                scrollOffset = -scrollLeft;
                break;
              case "positive-descending":
                scrollOffset = scrollWidth - clientWidth - scrollLeft;
                break;
            }
          }
          scrollOffset = Math.max(0, Math.min(scrollOffset, scrollWidth - clientWidth));
          return {
            isScrolling: true,
            scrollDirection: prevState.scrollOffset < scrollOffset ? "forward" : "backward",
            scrollOffset,
            scrollUpdateWasRequested: false
          };
        }, _this._resetIsScrollingDebounced);
      };
      _this._onScrollVertical = function(event) {
        var _event$currentTarget2 = event.currentTarget, clientHeight = _event$currentTarget2.clientHeight, scrollHeight = _event$currentTarget2.scrollHeight, scrollTop = _event$currentTarget2.scrollTop;
        _this.setState(function(prevState) {
          if (prevState.scrollOffset === scrollTop) {
            return null;
          }
          var scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
          return {
            isScrolling: true,
            scrollDirection: prevState.scrollOffset < scrollOffset ? "forward" : "backward",
            scrollOffset,
            scrollUpdateWasRequested: false
          };
        }, _this._resetIsScrollingDebounced);
      };
      _this._outerRefSetter = function(ref) {
        var outerRef = _this.props.outerRef;
        _this._outerRef = ref;
        if (typeof outerRef === "function") {
          outerRef(ref);
        } else if (outerRef != null && typeof outerRef === "object" && outerRef.hasOwnProperty("current")) {
          outerRef.current = ref;
        }
      };
      _this._resetIsScrollingDebounced = function() {
        if (_this._resetIsScrollingTimeoutId !== null) {
          cancelTimeout(_this._resetIsScrollingTimeoutId);
        }
        _this._resetIsScrollingTimeoutId = requestTimeout(_this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL$1);
      };
      _this._resetIsScrolling = function() {
        _this._resetIsScrollingTimeoutId = null;
        _this.setState({
          isScrolling: false
        }, function() {
          _this._getItemStyleCache(-1, null);
        });
      };
      return _this;
    }
    List.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
      validateSharedProps$1(nextProps, prevState);
      validateProps2(nextProps);
      return null;
    };
    var _proto = List.prototype;
    _proto.scrollTo = function scrollTo(scrollOffset) {
      scrollOffset = Math.max(0, scrollOffset);
      this.setState(function(prevState) {
        if (prevState.scrollOffset === scrollOffset) {
          return null;
        }
        return {
          scrollDirection: prevState.scrollOffset < scrollOffset ? "forward" : "backward",
          scrollOffset,
          scrollUpdateWasRequested: true
        };
      }, this._resetIsScrollingDebounced);
    };
    _proto.scrollToItem = function scrollToItem(index, align) {
      if (align === void 0) {
        align = "auto";
      }
      var _this$props2 = this.props, itemCount = _this$props2.itemCount, layout = _this$props2.layout;
      var scrollOffset = this.state.scrollOffset;
      index = Math.max(0, Math.min(index, itemCount - 1));
      var scrollbarSize = 0;
      if (this._outerRef) {
        var outerRef = this._outerRef;
        if (layout === "vertical") {
          scrollbarSize = outerRef.scrollWidth > outerRef.clientWidth ? getScrollbarSize() : 0;
        } else {
          scrollbarSize = outerRef.scrollHeight > outerRef.clientHeight ? getScrollbarSize() : 0;
        }
      }
      this.scrollTo(getOffsetForIndexAndAlignment2(this.props, index, align, scrollOffset, this._instanceProps, scrollbarSize));
    };
    _proto.componentDidMount = function componentDidMount() {
      var _this$props3 = this.props, direction = _this$props3.direction, initialScrollOffset = _this$props3.initialScrollOffset, layout = _this$props3.layout;
      if (typeof initialScrollOffset === "number" && this._outerRef != null) {
        var outerRef = this._outerRef;
        if (direction === "horizontal" || layout === "horizontal") {
          outerRef.scrollLeft = initialScrollOffset;
        } else {
          outerRef.scrollTop = initialScrollOffset;
        }
      }
      this._callPropsCallbacks();
    };
    _proto.componentDidUpdate = function componentDidUpdate() {
      var _this$props4 = this.props, direction = _this$props4.direction, layout = _this$props4.layout;
      var _this$state = this.state, scrollOffset = _this$state.scrollOffset, scrollUpdateWasRequested = _this$state.scrollUpdateWasRequested;
      if (scrollUpdateWasRequested && this._outerRef != null) {
        var outerRef = this._outerRef;
        if (direction === "horizontal" || layout === "horizontal") {
          if (direction === "rtl") {
            switch (getRTLOffsetType()) {
              case "negative":
                outerRef.scrollLeft = -scrollOffset;
                break;
              case "positive-ascending":
                outerRef.scrollLeft = scrollOffset;
                break;
              default:
                var clientWidth = outerRef.clientWidth, scrollWidth = outerRef.scrollWidth;
                outerRef.scrollLeft = scrollWidth - clientWidth - scrollOffset;
                break;
            }
          } else {
            outerRef.scrollLeft = scrollOffset;
          }
        } else {
          outerRef.scrollTop = scrollOffset;
        }
      }
      this._callPropsCallbacks();
    };
    _proto.componentWillUnmount = function componentWillUnmount() {
      if (this._resetIsScrollingTimeoutId !== null) {
        cancelTimeout(this._resetIsScrollingTimeoutId);
      }
    };
    _proto.render = function render() {
      var _this$props5 = this.props, children = _this$props5.children, className = _this$props5.className, direction = _this$props5.direction, height = _this$props5.height, innerRef = _this$props5.innerRef, innerElementType = _this$props5.innerElementType, innerTagName = _this$props5.innerTagName, itemCount = _this$props5.itemCount, itemData = _this$props5.itemData, _this$props5$itemKey = _this$props5.itemKey, itemKey = _this$props5$itemKey === void 0 ? defaultItemKey$1 : _this$props5$itemKey, layout = _this$props5.layout, outerElementType = _this$props5.outerElementType, outerTagName = _this$props5.outerTagName, style = _this$props5.style, useIsScrolling = _this$props5.useIsScrolling, width = _this$props5.width;
      var isScrolling = this.state.isScrolling;
      var isHorizontal = direction === "horizontal" || layout === "horizontal";
      var onScroll = isHorizontal ? this._onScrollHorizontal : this._onScrollVertical;
      var _this$_getRangeToRend = this._getRangeToRender(), startIndex = _this$_getRangeToRend[0], stopIndex = _this$_getRangeToRend[1];
      var items2 = [];
      if (itemCount > 0) {
        for (var _index = startIndex; _index <= stopIndex; _index++) {
          items2.push(k$7(children, {
            data: itemData,
            key: itemKey(_index, itemData),
            index: _index,
            isScrolling: useIsScrolling ? isScrolling : void 0,
            style: this._getItemStyle(_index)
          }));
        }
      }
      var estimatedTotalSize = getEstimatedTotalSize2(this.props, this._instanceProps);
      return k$7(outerElementType || outerTagName || "div", {
        className,
        onScroll,
        ref: this._outerRefSetter,
        style: _extends({
          position: "relative",
          height,
          width,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          willChange: "transform",
          direction
        }, style)
      }, k$7(innerElementType || innerTagName || "div", {
        children: items2,
        ref: innerRef,
        style: {
          height: isHorizontal ? "100%" : estimatedTotalSize,
          pointerEvents: isScrolling ? "none" : void 0,
          width: isHorizontal ? estimatedTotalSize : "100%"
        }
      }));
    };
    _proto._callPropsCallbacks = function _callPropsCallbacks() {
      if (typeof this.props.onItemsRendered === "function") {
        var itemCount = this.props.itemCount;
        if (itemCount > 0) {
          var _this$_getRangeToRend2 = this._getRangeToRender(), _overscanStartIndex = _this$_getRangeToRend2[0], _overscanStopIndex = _this$_getRangeToRend2[1], _visibleStartIndex = _this$_getRangeToRend2[2], _visibleStopIndex = _this$_getRangeToRend2[3];
          this._callOnItemsRendered(_overscanStartIndex, _overscanStopIndex, _visibleStartIndex, _visibleStopIndex);
        }
      }
      if (typeof this.props.onScroll === "function") {
        var _this$state2 = this.state, _scrollDirection = _this$state2.scrollDirection, _scrollOffset = _this$state2.scrollOffset, _scrollUpdateWasRequested = _this$state2.scrollUpdateWasRequested;
        this._callOnScroll(_scrollDirection, _scrollOffset, _scrollUpdateWasRequested);
      }
    };
    _proto._getRangeToRender = function _getRangeToRender() {
      var _this$props6 = this.props, itemCount = _this$props6.itemCount, overscanCount = _this$props6.overscanCount;
      var _this$state3 = this.state, isScrolling = _this$state3.isScrolling, scrollDirection = _this$state3.scrollDirection, scrollOffset = _this$state3.scrollOffset;
      if (itemCount === 0) {
        return [0, 0, 0, 0];
      }
      var startIndex = getStartIndexForOffset2(this.props, scrollOffset, this._instanceProps);
      var stopIndex = getStopIndexForStartIndex2(this.props, startIndex, scrollOffset, this._instanceProps);
      var overscanBackward = !isScrolling || scrollDirection === "backward" ? Math.max(1, overscanCount) : 1;
      var overscanForward = !isScrolling || scrollDirection === "forward" ? Math.max(1, overscanCount) : 1;
      return [Math.max(0, startIndex - overscanBackward), Math.max(0, Math.min(itemCount - 1, stopIndex + overscanForward)), startIndex, stopIndex];
    };
    return List;
  })(M$2), _class.defaultProps = {
    direction: "ltr",
    itemData: void 0,
    layout: "vertical",
    overscanCount: 2,
    useIsScrolling: false
  }, _class;
}
var validateSharedProps$1 = function validateSharedProps(_ref2, _ref3) {
  _ref2.children;
  _ref2.direction;
  _ref2.height;
  _ref2.layout;
  _ref2.innerTagName;
  _ref2.outerTagName;
  _ref2.width;
  _ref3.instance;
};
var FixedSizeList = /* @__PURE__ */ createListComponent({
  getItemOffset: function getItemOffset(_ref, index) {
    var itemSize = _ref.itemSize;
    return index * itemSize;
  },
  getItemSize: function getItemSize(_ref2, index) {
    var itemSize = _ref2.itemSize;
    return itemSize;
  },
  getEstimatedTotalSize: function getEstimatedTotalSize(_ref3) {
    var itemCount = _ref3.itemCount, itemSize = _ref3.itemSize;
    return itemSize * itemCount;
  },
  getOffsetForIndexAndAlignment: function getOffsetForIndexAndAlignment(_ref4, index, align, scrollOffset, instanceProps, scrollbarSize) {
    var direction = _ref4.direction, height = _ref4.height, itemCount = _ref4.itemCount, itemSize = _ref4.itemSize, layout = _ref4.layout, width = _ref4.width;
    var isHorizontal = direction === "horizontal" || layout === "horizontal";
    var size2 = isHorizontal ? width : height;
    var lastItemOffset = Math.max(0, itemCount * itemSize - size2);
    var maxOffset = Math.min(lastItemOffset, index * itemSize);
    var minOffset = Math.max(0, index * itemSize - size2 + itemSize + scrollbarSize);
    if (align === "smart") {
      if (scrollOffset >= minOffset - size2 && scrollOffset <= maxOffset + size2) {
        align = "auto";
      } else {
        align = "center";
      }
    }
    switch (align) {
      case "start":
        return maxOffset;
      case "end":
        return minOffset;
      case "center": {
        var middleOffset = Math.round(minOffset + (maxOffset - minOffset) / 2);
        if (middleOffset < Math.ceil(size2 / 2)) {
          return 0;
        } else if (middleOffset > lastItemOffset + Math.floor(size2 / 2)) {
          return lastItemOffset;
        } else {
          return middleOffset;
        }
      }
      case "auto":
      default:
        if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
          return scrollOffset;
        } else if (scrollOffset < minOffset) {
          return minOffset;
        } else {
          return maxOffset;
        }
    }
  },
  getStartIndexForOffset: function getStartIndexForOffset(_ref5, offset) {
    var itemCount = _ref5.itemCount, itemSize = _ref5.itemSize;
    return Math.max(0, Math.min(itemCount - 1, Math.floor(offset / itemSize)));
  },
  getStopIndexForStartIndex: function getStopIndexForStartIndex(_ref6, startIndex, scrollOffset) {
    var direction = _ref6.direction, height = _ref6.height, itemCount = _ref6.itemCount, itemSize = _ref6.itemSize, layout = _ref6.layout, width = _ref6.width;
    var isHorizontal = direction === "horizontal" || layout === "horizontal";
    var offset = startIndex * itemSize;
    var size2 = isHorizontal ? width : height;
    var numVisibleItems = Math.ceil((size2 + scrollOffset - offset) / itemSize);
    return Math.max(0, Math.min(
      itemCount - 1,
      startIndex + numVisibleItems - 1
      // -1 is because stop index is inclusive
    ));
  },
  initInstanceProps: function initInstanceProps(props) {
  },
  shouldResetStyleCacheOnItemSizeChange: true,
  validateProps: function validateProps(_ref7) {
    _ref7.itemSize;
  }
});
function Cursor() {
  var _a, _b;
  const tree = useTreeApi();
  const state = useDndContext();
  const cursor = state.cursor;
  if (!cursor || cursor.type !== "line") return null;
  const indent = tree.indent;
  const top = tree.rowHeight * cursor.index + ((_b = (_a = tree.props.padding) !== null && _a !== void 0 ? _a : tree.props.paddingTop) !== null && _b !== void 0 ? _b : 0);
  const left = indent * cursor.level;
  const Cursor2 = tree.renderCursor;
  return u$5(Cursor2, {
    top,
    left,
    indent
  });
}
var __rest$1 = function(s2, e2) {
  var t2 = {};
  for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0) t2[p2] = s2[p2];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function") for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
    if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2])) t2[p2[i2]] = s2[p2[i2]];
  }
  return t2;
};
const ListOuterElement = D$3(function Outer(props, ref) {
  const {
    children
  } = props, rest = __rest$1(props, ["children"]);
  const tree = useTreeApi();
  return u$5("div", Object.assign({
    // @ts-ignore
    ref
  }, rest, {
    onClick: (e2) => {
      if (e2.currentTarget === e2.target) tree.deselectAll();
    },
    children: [u$5(DropContainer, {}), children]
  }));
});
const DropContainer = () => {
  const tree = useTreeApi();
  return u$5("div", {
    style: {
      height: tree.visibleNodes.length * tree.rowHeight,
      width: "100%",
      position: "absolute",
      left: "0",
      right: "0"
    },
    children: u$5(Cursor, {})
  });
};
var __rest = function(s2, e2) {
  var t2 = {};
  for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0) t2[p2] = s2[p2];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function") for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
    if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2])) t2[p2[i2]] = s2[p2[i2]];
  }
  return t2;
};
const ListInnerElement = D$3(function InnerElement(_a, ref) {
  var _b, _c, _d, _e;
  var {
    style
  } = _a, rest = __rest(_a, ["style"]);
  const tree = useTreeApi();
  const paddingTop = (_c = (_b = tree.props.padding) !== null && _b !== void 0 ? _b : tree.props.paddingTop) !== null && _c !== void 0 ? _c : 0;
  const paddingBottom = (_e = (_d = tree.props.padding) !== null && _d !== void 0 ? _d : tree.props.paddingBottom) !== null && _e !== void 0 ? _e : 0;
  return u$5("div", Object.assign({
    ref,
    style: Object.assign(Object.assign({}, style), {
      height: `${parseFloat(style.height) + paddingTop + paddingBottom}px`
    })
  }, rest));
});
var DndContext = X$4({
  dragDropManager: void 0
});
var HandlerRole;
(function(HandlerRole2) {
  HandlerRole2["SOURCE"] = "SOURCE";
  HandlerRole2["TARGET"] = "TARGET";
})(HandlerRole || (HandlerRole = {}));
function invariant(condition, format) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  if (!condition) {
    var error;
    if (format === void 0) {
      error = new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
    } else {
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function() {
        return args[argIndex++];
      }));
      error.name = "Invariant Violation";
    }
    error.framesToPop = 1;
    throw error;
  }
}
var INIT_COORDS = "dnd-core/INIT_COORDS";
var BEGIN_DRAG = "dnd-core/BEGIN_DRAG";
var PUBLISH_DRAG_SOURCE = "dnd-core/PUBLISH_DRAG_SOURCE";
var HOVER = "dnd-core/HOVER";
var DROP = "dnd-core/DROP";
var END_DRAG = "dnd-core/END_DRAG";
function setClientOffset(clientOffset, sourceClientOffset) {
  return {
    type: INIT_COORDS,
    payload: {
      sourceClientOffset: sourceClientOffset || null,
      clientOffset: clientOffset || null
    }
  };
}
function _typeof$3(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof$3 = function _typeof2(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof$3 = function _typeof2(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof$3(obj);
}
function get(obj, path, defaultValue) {
  return path.split(".").reduce(function(a2, c2) {
    return a2 && a2[c2] ? a2[c2] : defaultValue || null;
  }, obj);
}
function without$1(items2, item) {
  return items2.filter(function(i2) {
    return i2 !== item;
  });
}
function isObject(input) {
  return _typeof$3(input) === "object";
}
function xor(itemsA, itemsB) {
  var map = /* @__PURE__ */ new Map();
  var insertItem = function insertItem2(item) {
    map.set(item, map.has(item) ? map.get(item) + 1 : 1);
  };
  itemsA.forEach(insertItem);
  itemsB.forEach(insertItem);
  var result = [];
  map.forEach(function(count, key) {
    if (count === 1) {
      result.push(key);
    }
  });
  return result;
}
function intersection(itemsA, itemsB) {
  return itemsA.filter(function(t2) {
    return itemsB.indexOf(t2) > -1;
  });
}
var ResetCoordinatesAction = {
  type: INIT_COORDS,
  payload: {
    clientOffset: null,
    sourceClientOffset: null
  }
};
function createBeginDrag(manager) {
  return function beginDrag() {
    var sourceIds = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    var options2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
      publishSource: true
    };
    var _options$publishSourc = options2.publishSource, publishSource = _options$publishSourc === void 0 ? true : _options$publishSourc, clientOffset = options2.clientOffset, getSourceClientOffset2 = options2.getSourceClientOffset;
    var monitor = manager.getMonitor();
    var registry = manager.getRegistry();
    manager.dispatch(setClientOffset(clientOffset));
    verifyInvariants$1(sourceIds, monitor, registry);
    var sourceId = getDraggableSource(sourceIds, monitor);
    if (sourceId === null) {
      manager.dispatch(ResetCoordinatesAction);
      return;
    }
    var sourceClientOffset = null;
    if (clientOffset) {
      if (!getSourceClientOffset2) {
        throw new Error("getSourceClientOffset must be defined");
      }
      verifyGetSourceClientOffsetIsFunction(getSourceClientOffset2);
      sourceClientOffset = getSourceClientOffset2(sourceId);
    }
    manager.dispatch(setClientOffset(clientOffset, sourceClientOffset));
    var source = registry.getSource(sourceId);
    var item = source.beginDrag(monitor, sourceId);
    if (item == null) {
      return void 0;
    }
    verifyItemIsObject(item);
    registry.pinSource(sourceId);
    var itemType = registry.getSourceType(sourceId);
    return {
      type: BEGIN_DRAG,
      payload: {
        itemType,
        item,
        sourceId,
        clientOffset: clientOffset || null,
        sourceClientOffset: sourceClientOffset || null,
        isSourcePublic: !!publishSource
      }
    };
  };
}
function verifyInvariants$1(sourceIds, monitor, registry) {
  invariant(!monitor.isDragging(), "Cannot call beginDrag while dragging.");
  sourceIds.forEach(function(sourceId) {
    invariant(registry.getSource(sourceId), "Expected sourceIds to be registered.");
  });
}
function verifyGetSourceClientOffsetIsFunction(getSourceClientOffset2) {
  invariant(typeof getSourceClientOffset2 === "function", "When clientOffset is provided, getSourceClientOffset must be a function.");
}
function verifyItemIsObject(item) {
  invariant(isObject(item), "Item must be an object.");
}
function getDraggableSource(sourceIds, monitor) {
  var sourceId = null;
  for (var i2 = sourceIds.length - 1; i2 >= 0; i2--) {
    if (monitor.canDragSource(sourceIds[i2])) {
      sourceId = sourceIds[i2];
      break;
    }
  }
  return sourceId;
}
function createPublishDragSource(manager) {
  return function publishDragSource() {
    var monitor = manager.getMonitor();
    if (monitor.isDragging()) {
      return {
        type: PUBLISH_DRAG_SOURCE
      };
    }
  };
}
function matchesType(targetType, draggedItemType) {
  if (draggedItemType === null) {
    return targetType === null;
  }
  return Array.isArray(targetType) ? targetType.some(function(t2) {
    return t2 === draggedItemType;
  }) : targetType === draggedItemType;
}
function createHover(manager) {
  return function hover(targetIdsArg) {
    var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, clientOffset = _ref.clientOffset;
    verifyTargetIdsIsArray(targetIdsArg);
    var targetIds = targetIdsArg.slice(0);
    var monitor = manager.getMonitor();
    var registry = manager.getRegistry();
    checkInvariants(targetIds, monitor, registry);
    var draggedItemType = monitor.getItemType();
    removeNonMatchingTargetIds(targetIds, registry, draggedItemType);
    hoverAllTargets(targetIds, monitor, registry);
    return {
      type: HOVER,
      payload: {
        targetIds,
        clientOffset: clientOffset || null
      }
    };
  };
}
function verifyTargetIdsIsArray(targetIdsArg) {
  invariant(Array.isArray(targetIdsArg), "Expected targetIds to be an array.");
}
function checkInvariants(targetIds, monitor, registry) {
  invariant(monitor.isDragging(), "Cannot call hover while not dragging.");
  invariant(!monitor.didDrop(), "Cannot call hover after drop.");
  for (var i2 = 0; i2 < targetIds.length; i2++) {
    var targetId = targetIds[i2];
    invariant(targetIds.lastIndexOf(targetId) === i2, "Expected targetIds to be unique in the passed array.");
    var target = registry.getTarget(targetId);
    invariant(target, "Expected targetIds to be registered.");
  }
}
function removeNonMatchingTargetIds(targetIds, registry, draggedItemType) {
  for (var i2 = targetIds.length - 1; i2 >= 0; i2--) {
    var targetId = targetIds[i2];
    var targetType = registry.getTargetType(targetId);
    if (!matchesType(targetType, draggedItemType)) {
      targetIds.splice(i2, 1);
    }
  }
}
function hoverAllTargets(targetIds, monitor, registry) {
  targetIds.forEach(function(targetId) {
    var target = registry.getTarget(targetId);
    target.hover(monitor, targetId);
  });
}
function ownKeys$4(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$4(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys$4(Object(source), true).forEach(function(key) {
        _defineProperty$j(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$4(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty$j(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function createDrop(manager) {
  return function drop() {
    var options2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var monitor = manager.getMonitor();
    var registry = manager.getRegistry();
    verifyInvariants(monitor);
    var targetIds = getDroppableTargets(monitor);
    targetIds.forEach(function(targetId, index) {
      var dropResult = determineDropResult(targetId, index, registry, monitor);
      var action = {
        type: DROP,
        payload: {
          dropResult: _objectSpread$4(_objectSpread$4({}, options2), dropResult)
        }
      };
      manager.dispatch(action);
    });
  };
}
function verifyInvariants(monitor) {
  invariant(monitor.isDragging(), "Cannot call drop while not dragging.");
  invariant(!monitor.didDrop(), "Cannot call drop twice during one drag operation.");
}
function determineDropResult(targetId, index, registry, monitor) {
  var target = registry.getTarget(targetId);
  var dropResult = target ? target.drop(monitor, targetId) : void 0;
  verifyDropResultType(dropResult);
  if (typeof dropResult === "undefined") {
    dropResult = index === 0 ? {} : monitor.getDropResult();
  }
  return dropResult;
}
function verifyDropResultType(dropResult) {
  invariant(typeof dropResult === "undefined" || isObject(dropResult), "Drop result must either be an object or undefined.");
}
function getDroppableTargets(monitor) {
  var targetIds = monitor.getTargetIds().filter(monitor.canDropOnTarget, monitor);
  targetIds.reverse();
  return targetIds;
}
function createEndDrag(manager) {
  return function endDrag() {
    var monitor = manager.getMonitor();
    var registry = manager.getRegistry();
    verifyIsDragging(monitor);
    var sourceId = monitor.getSourceId();
    if (sourceId != null) {
      var source = registry.getSource(sourceId, true);
      source.endDrag(monitor, sourceId);
      registry.unpinSource();
    }
    return {
      type: END_DRAG
    };
  };
}
function verifyIsDragging(monitor) {
  invariant(monitor.isDragging(), "Cannot call endDrag while not dragging.");
}
function createDragDropActions(manager) {
  return {
    beginDrag: createBeginDrag(manager),
    publishDragSource: createPublishDragSource(manager),
    hover: createHover(manager),
    drop: createDrop(manager),
    endDrag: createEndDrag(manager)
  };
}
function _classCallCheck$e(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$e(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$e(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$e(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$i(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var DragDropManagerImpl = /* @__PURE__ */ (function() {
  function DragDropManagerImpl2(store, monitor) {
    var _this = this;
    _classCallCheck$e(this, DragDropManagerImpl2);
    _defineProperty$i(this, "store", void 0);
    _defineProperty$i(this, "monitor", void 0);
    _defineProperty$i(this, "backend", void 0);
    _defineProperty$i(this, "isSetUp", false);
    _defineProperty$i(this, "handleRefCountChange", function() {
      var shouldSetUp = _this.store.getState().refCount > 0;
      if (_this.backend) {
        if (shouldSetUp && !_this.isSetUp) {
          _this.backend.setup();
          _this.isSetUp = true;
        } else if (!shouldSetUp && _this.isSetUp) {
          _this.backend.teardown();
          _this.isSetUp = false;
        }
      }
    });
    this.store = store;
    this.monitor = monitor;
    store.subscribe(this.handleRefCountChange);
  }
  _createClass$e(DragDropManagerImpl2, [{
    key: "receiveBackend",
    value: function receiveBackend(backend) {
      this.backend = backend;
    }
  }, {
    key: "getMonitor",
    value: function getMonitor() {
      return this.monitor;
    }
  }, {
    key: "getBackend",
    value: function getBackend() {
      return this.backend;
    }
  }, {
    key: "getRegistry",
    value: function getRegistry() {
      return this.monitor.registry;
    }
  }, {
    key: "getActions",
    value: function getActions() {
      var manager = this;
      var dispatch = this.store.dispatch;
      function bindActionCreator(actionCreator) {
        return function() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          var action = actionCreator.apply(manager, args);
          if (typeof action !== "undefined") {
            dispatch(action);
          }
        };
      }
      var actions2 = createDragDropActions(this);
      return Object.keys(actions2).reduce(function(boundActions, key) {
        var action = actions2[key];
        boundActions[key] = bindActionCreator(action);
        return boundActions;
      }, {});
    }
  }, {
    key: "dispatch",
    value: function dispatch(action) {
      this.store.dispatch(action);
    }
  }]);
  return DragDropManagerImpl2;
})();
function formatProdErrorMessage$1(code2) {
  return "Minified Redux error #" + code2 + "; visit https://redux.js.org/Errors?code=" + code2 + " for the full message or use the non-minified dev environment for full errors. ";
}
var $$observable$1 = (function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
})();
var randomString$1 = function randomString() {
  return Math.random().toString(36).substring(7).split("").join(".");
};
var ActionTypes$1 = {
  INIT: "@@redux/INIT" + randomString$1(),
  REPLACE: "@@redux/REPLACE" + randomString$1()
};
function isPlainObject$1(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  var proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}
function createStore$1(reducer2, preloadedState, enhancer) {
  var _ref2;
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error(formatProdErrorMessage$1(0));
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(formatProdErrorMessage$1(1));
    }
    return enhancer(createStore$1)(reducer2, preloadedState);
  }
  if (typeof reducer2 !== "function") {
    throw new Error(formatProdErrorMessage$1(2));
  }
  var currentReducer = reducer2;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error(formatProdErrorMessage$1(3));
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(formatProdErrorMessage$1(4));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage$1(5));
    }
    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error(formatProdErrorMessage$1(6));
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject$1(action)) {
      throw new Error(formatProdErrorMessage$1(7));
    }
    if (typeof action.type === "undefined") {
      throw new Error(formatProdErrorMessage$1(8));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage$1(9));
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    var listeners = currentListeners = nextListeners;
    for (var i2 = 0; i2 < listeners.length; i2++) {
      var listener = listeners[i2];
      listener();
    }
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(formatProdErrorMessage$1(10));
    }
    currentReducer = nextReducer;
    dispatch({
      type: ActionTypes$1.REPLACE
    });
  }
  function observable() {
    var _ref;
    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe2(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(formatProdErrorMessage$1(11));
        }
        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }
        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      }
    }, _ref[$$observable$1] = function() {
      return this;
    }, _ref;
  }
  dispatch({
    type: ActionTypes$1.INIT
  });
  return _ref2 = {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  }, _ref2[$$observable$1] = observable, _ref2;
}
var strictEquality = function strictEquality2(a2, b2) {
  return a2 === b2;
};
function areCoordsEqual(offsetA, offsetB) {
  if (!offsetA && !offsetB) {
    return true;
  } else if (!offsetA || !offsetB) {
    return false;
  } else {
    return offsetA.x === offsetB.x && offsetA.y === offsetB.y;
  }
}
function areArraysEqual(a2, b2) {
  var isEqual2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : strictEquality;
  if (a2.length !== b2.length) {
    return false;
  }
  for (var i2 = 0; i2 < a2.length; ++i2) {
    if (!isEqual2(a2[i2], b2[i2])) {
      return false;
    }
  }
  return true;
}
function ownKeys$3(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$3(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys$3(Object(source), true).forEach(function(key) {
        _defineProperty$h(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$3(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty$h(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var initialState$1 = {
  initialSourceClientOffset: null,
  initialClientOffset: null,
  clientOffset: null
};
function reduce$5() {
  var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : initialState$1;
  var action = arguments.length > 1 ? arguments[1] : void 0;
  var payload = action.payload;
  switch (action.type) {
    case INIT_COORDS:
    case BEGIN_DRAG:
      return {
        initialSourceClientOffset: payload.sourceClientOffset,
        initialClientOffset: payload.clientOffset,
        clientOffset: payload.clientOffset
      };
    case HOVER:
      if (areCoordsEqual(state.clientOffset, payload.clientOffset)) {
        return state;
      }
      return _objectSpread$3(_objectSpread$3({}, state), {}, {
        clientOffset: payload.clientOffset
      });
    case END_DRAG:
    case DROP:
      return initialState$1;
    default:
      return state;
  }
}
var ADD_SOURCE = "dnd-core/ADD_SOURCE";
var ADD_TARGET = "dnd-core/ADD_TARGET";
var REMOVE_SOURCE = "dnd-core/REMOVE_SOURCE";
var REMOVE_TARGET = "dnd-core/REMOVE_TARGET";
function addSource(sourceId) {
  return {
    type: ADD_SOURCE,
    payload: {
      sourceId
    }
  };
}
function addTarget(targetId) {
  return {
    type: ADD_TARGET,
    payload: {
      targetId
    }
  };
}
function removeSource(sourceId) {
  return {
    type: REMOVE_SOURCE,
    payload: {
      sourceId
    }
  };
}
function removeTarget(targetId) {
  return {
    type: REMOVE_TARGET,
    payload: {
      targetId
    }
  };
}
function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$2(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys$2(Object(source), true).forEach(function(key) {
        _defineProperty$g(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$2(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty$g(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var initialState = {
  itemType: null,
  item: null,
  sourceId: null,
  targetIds: [],
  dropResult: null,
  didDrop: false,
  isSourcePublic: null
};
function reduce$4() {
  var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : void 0;
  var payload = action.payload;
  switch (action.type) {
    case BEGIN_DRAG:
      return _objectSpread$2(_objectSpread$2({}, state), {}, {
        itemType: payload.itemType,
        item: payload.item,
        sourceId: payload.sourceId,
        isSourcePublic: payload.isSourcePublic,
        dropResult: null,
        didDrop: false
      });
    case PUBLISH_DRAG_SOURCE:
      return _objectSpread$2(_objectSpread$2({}, state), {}, {
        isSourcePublic: true
      });
    case HOVER:
      return _objectSpread$2(_objectSpread$2({}, state), {}, {
        targetIds: payload.targetIds
      });
    case REMOVE_TARGET:
      if (state.targetIds.indexOf(payload.targetId) === -1) {
        return state;
      }
      return _objectSpread$2(_objectSpread$2({}, state), {}, {
        targetIds: without$1(state.targetIds, payload.targetId)
      });
    case DROP:
      return _objectSpread$2(_objectSpread$2({}, state), {}, {
        dropResult: payload.dropResult,
        didDrop: true,
        targetIds: []
      });
    case END_DRAG:
      return _objectSpread$2(_objectSpread$2({}, state), {}, {
        itemType: null,
        item: null,
        sourceId: null,
        dropResult: null,
        didDrop: false,
        isSourcePublic: null,
        targetIds: []
      });
    default:
      return state;
  }
}
function reduce$3() {
  var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
  var action = arguments.length > 1 ? arguments[1] : void 0;
  switch (action.type) {
    case ADD_SOURCE:
    case ADD_TARGET:
      return state + 1;
    case REMOVE_SOURCE:
    case REMOVE_TARGET:
      return state - 1;
    default:
      return state;
  }
}
var NONE = [];
var ALL = [];
NONE.__IS_NONE__ = true;
ALL.__IS_ALL__ = true;
function areDirty(dirtyIds, handlerIds) {
  if (dirtyIds === NONE) {
    return false;
  }
  if (dirtyIds === ALL || typeof handlerIds === "undefined") {
    return true;
  }
  var commonIds = intersection(handlerIds, dirtyIds);
  return commonIds.length > 0;
}
function reduce$2() {
  var action = arguments.length > 1 ? arguments[1] : void 0;
  switch (action.type) {
    case HOVER:
      break;
    case ADD_SOURCE:
    case ADD_TARGET:
    case REMOVE_TARGET:
    case REMOVE_SOURCE:
      return NONE;
    case BEGIN_DRAG:
    case PUBLISH_DRAG_SOURCE:
    case END_DRAG:
    case DROP:
    default:
      return ALL;
  }
  var _action$payload = action.payload, _action$payload$targe = _action$payload.targetIds, targetIds = _action$payload$targe === void 0 ? [] : _action$payload$targe, _action$payload$prevT = _action$payload.prevTargetIds, prevTargetIds = _action$payload$prevT === void 0 ? [] : _action$payload$prevT;
  var result = xor(targetIds, prevTargetIds);
  var didChange2 = result.length > 0 || !areArraysEqual(targetIds, prevTargetIds);
  if (!didChange2) {
    return NONE;
  }
  var prevInnermostTargetId = prevTargetIds[prevTargetIds.length - 1];
  var innermostTargetId = targetIds[targetIds.length - 1];
  if (prevInnermostTargetId !== innermostTargetId) {
    if (prevInnermostTargetId) {
      result.push(prevInnermostTargetId);
    }
    if (innermostTargetId) {
      result.push(innermostTargetId);
    }
  }
  return result;
}
function reduce$1() {
  var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
  return state + 1;
}
function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$1(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys$1(Object(source), true).forEach(function(key) {
        _defineProperty$f(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$1(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty$f(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function reduce() {
  var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : void 0;
  return {
    dirtyHandlerIds: reduce$2(state.dirtyHandlerIds, {
      type: action.type,
      payload: _objectSpread$1(_objectSpread$1({}, action.payload), {}, {
        prevTargetIds: get(state, "dragOperation.targetIds", [])
      })
    }),
    dragOffset: reduce$5(state.dragOffset, action),
    refCount: reduce$3(state.refCount, action),
    dragOperation: reduce$4(state.dragOperation, action),
    stateId: reduce$1(state.stateId)
  };
}
function add(a2, b2) {
  return {
    x: a2.x + b2.x,
    y: a2.y + b2.y
  };
}
function subtract(a2, b2) {
  return {
    x: a2.x - b2.x,
    y: a2.y - b2.y
  };
}
function getSourceClientOffset(state) {
  var clientOffset = state.clientOffset, initialClientOffset = state.initialClientOffset, initialSourceClientOffset = state.initialSourceClientOffset;
  if (!clientOffset || !initialClientOffset || !initialSourceClientOffset) {
    return null;
  }
  return subtract(add(clientOffset, initialSourceClientOffset), initialClientOffset);
}
function getDifferenceFromInitialOffset(state) {
  var clientOffset = state.clientOffset, initialClientOffset = state.initialClientOffset;
  if (!clientOffset || !initialClientOffset) {
    return null;
  }
  return subtract(clientOffset, initialClientOffset);
}
function _classCallCheck$d(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$d(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$d(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$d(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$e(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var DragDropMonitorImpl = /* @__PURE__ */ (function() {
  function DragDropMonitorImpl2(store, registry) {
    _classCallCheck$d(this, DragDropMonitorImpl2);
    _defineProperty$e(this, "store", void 0);
    _defineProperty$e(this, "registry", void 0);
    this.store = store;
    this.registry = registry;
  }
  _createClass$d(DragDropMonitorImpl2, [{
    key: "subscribeToStateChange",
    value: function subscribeToStateChange(listener) {
      var _this = this;
      var options2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
        handlerIds: void 0
      };
      var handlerIds = options2.handlerIds;
      invariant(typeof listener === "function", "listener must be a function.");
      invariant(typeof handlerIds === "undefined" || Array.isArray(handlerIds), "handlerIds, when specified, must be an array of strings.");
      var prevStateId = this.store.getState().stateId;
      var handleChange = function handleChange2() {
        var state = _this.store.getState();
        var currentStateId = state.stateId;
        try {
          var canSkipListener = currentStateId === prevStateId || currentStateId === prevStateId + 1 && !areDirty(state.dirtyHandlerIds, handlerIds);
          if (!canSkipListener) {
            listener();
          }
        } finally {
          prevStateId = currentStateId;
        }
      };
      return this.store.subscribe(handleChange);
    }
  }, {
    key: "subscribeToOffsetChange",
    value: function subscribeToOffsetChange(listener) {
      var _this2 = this;
      invariant(typeof listener === "function", "listener must be a function.");
      var previousState = this.store.getState().dragOffset;
      var handleChange = function handleChange2() {
        var nextState = _this2.store.getState().dragOffset;
        if (nextState === previousState) {
          return;
        }
        previousState = nextState;
        listener();
      };
      return this.store.subscribe(handleChange);
    }
  }, {
    key: "canDragSource",
    value: function canDragSource(sourceId) {
      if (!sourceId) {
        return false;
      }
      var source = this.registry.getSource(sourceId);
      invariant(source, "Expected to find a valid source. sourceId=".concat(sourceId));
      if (this.isDragging()) {
        return false;
      }
      return source.canDrag(this, sourceId);
    }
  }, {
    key: "canDropOnTarget",
    value: function canDropOnTarget(targetId) {
      if (!targetId) {
        return false;
      }
      var target = this.registry.getTarget(targetId);
      invariant(target, "Expected to find a valid target. targetId=".concat(targetId));
      if (!this.isDragging() || this.didDrop()) {
        return false;
      }
      var targetType = this.registry.getTargetType(targetId);
      var draggedItemType = this.getItemType();
      return matchesType(targetType, draggedItemType) && target.canDrop(this, targetId);
    }
  }, {
    key: "isDragging",
    value: function isDragging() {
      return Boolean(this.getItemType());
    }
  }, {
    key: "isDraggingSource",
    value: function isDraggingSource(sourceId) {
      if (!sourceId) {
        return false;
      }
      var source = this.registry.getSource(sourceId, true);
      invariant(source, "Expected to find a valid source. sourceId=".concat(sourceId));
      if (!this.isDragging() || !this.isSourcePublic()) {
        return false;
      }
      var sourceType = this.registry.getSourceType(sourceId);
      var draggedItemType = this.getItemType();
      if (sourceType !== draggedItemType) {
        return false;
      }
      return source.isDragging(this, sourceId);
    }
  }, {
    key: "isOverTarget",
    value: function isOverTarget(targetId) {
      var options2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
        shallow: false
      };
      if (!targetId) {
        return false;
      }
      var shallow = options2.shallow;
      if (!this.isDragging()) {
        return false;
      }
      var targetType = this.registry.getTargetType(targetId);
      var draggedItemType = this.getItemType();
      if (draggedItemType && !matchesType(targetType, draggedItemType)) {
        return false;
      }
      var targetIds = this.getTargetIds();
      if (!targetIds.length) {
        return false;
      }
      var index = targetIds.indexOf(targetId);
      if (shallow) {
        return index === targetIds.length - 1;
      } else {
        return index > -1;
      }
    }
  }, {
    key: "getItemType",
    value: function getItemType() {
      return this.store.getState().dragOperation.itemType;
    }
  }, {
    key: "getItem",
    value: function getItem() {
      return this.store.getState().dragOperation.item;
    }
  }, {
    key: "getSourceId",
    value: function getSourceId() {
      return this.store.getState().dragOperation.sourceId;
    }
  }, {
    key: "getTargetIds",
    value: function getTargetIds() {
      return this.store.getState().dragOperation.targetIds;
    }
  }, {
    key: "getDropResult",
    value: function getDropResult() {
      return this.store.getState().dragOperation.dropResult;
    }
  }, {
    key: "didDrop",
    value: function didDrop() {
      return this.store.getState().dragOperation.didDrop;
    }
  }, {
    key: "isSourcePublic",
    value: function isSourcePublic() {
      return Boolean(this.store.getState().dragOperation.isSourcePublic);
    }
  }, {
    key: "getInitialClientOffset",
    value: function getInitialClientOffset() {
      return this.store.getState().dragOffset.initialClientOffset;
    }
  }, {
    key: "getInitialSourceClientOffset",
    value: function getInitialSourceClientOffset() {
      return this.store.getState().dragOffset.initialSourceClientOffset;
    }
  }, {
    key: "getClientOffset",
    value: function getClientOffset() {
      return this.store.getState().dragOffset.clientOffset;
    }
  }, {
    key: "getSourceClientOffset",
    value: function getSourceClientOffset$1() {
      return getSourceClientOffset(this.store.getState().dragOffset);
    }
  }, {
    key: "getDifferenceFromInitialOffset",
    value: function getDifferenceFromInitialOffset$1() {
      return getDifferenceFromInitialOffset(this.store.getState().dragOffset);
    }
  }]);
  return DragDropMonitorImpl2;
})();
var nextUniqueId = 0;
function getNextUniqueId() {
  return nextUniqueId++;
}
function _typeof$2(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof$2 = function _typeof2(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof$2 = function _typeof2(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof$2(obj);
}
function validateSourceContract(source) {
  invariant(typeof source.canDrag === "function", "Expected canDrag to be a function.");
  invariant(typeof source.beginDrag === "function", "Expected beginDrag to be a function.");
  invariant(typeof source.endDrag === "function", "Expected endDrag to be a function.");
}
function validateTargetContract(target) {
  invariant(typeof target.canDrop === "function", "Expected canDrop to be a function.");
  invariant(typeof target.hover === "function", "Expected hover to be a function.");
  invariant(typeof target.drop === "function", "Expected beginDrag to be a function.");
}
function validateType(type, allowArray) {
  if (allowArray && Array.isArray(type)) {
    type.forEach(function(t2) {
      return validateType(t2, false);
    });
    return;
  }
  invariant(typeof type === "string" || _typeof$2(type) === "symbol", allowArray ? "Type can only be a string, a symbol, or an array of either." : "Type can only be a string or a symbol.");
}
const scope = typeof global !== "undefined" ? global : self;
const BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;
function makeRequestCallFromTimer(callback) {
  return function requestCall() {
    const timeoutHandle = setTimeout(handleTimer, 0);
    const intervalHandle = setInterval(handleTimer, 50);
    function handleTimer() {
      clearTimeout(timeoutHandle);
      clearInterval(intervalHandle);
      callback();
    }
  };
}
function makeRequestCallFromMutationObserver(callback) {
  let toggle = 1;
  const observer = new BrowserMutationObserver(callback);
  const node = document.createTextNode("");
  observer.observe(node, {
    characterData: true
  });
  return function requestCall() {
    toggle = -toggle;
    node.data = toggle;
  };
}
const makeRequestCall = typeof BrowserMutationObserver === "function" ? (
  // reliably everywhere they are implemented.
  // They are implemented in all modern browsers.
  //
  // - Android 4-4.3
  // - Chrome 26-34
  // - Firefox 14-29
  // - Internet Explorer 11
  // - iPad Safari 6-7.1
  // - iPhone Safari 7-7.1
  // - Safari 6-7
  makeRequestCallFromMutationObserver
) : (
  // task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
  // 11-12, and in web workers in many engines.
  // Although message channels yield to any queued rendering and IO tasks, they
  // would be better than imposing the 4ms delay of timers.
  // However, they do not work reliably in Internet Explorer or Safari.
  // Internet Explorer 10 is the only browser that has setImmediate but does
  // not have MutationObservers.
  // Although setImmediate yields to the browser's renderer, it would be
  // preferrable to falling back to setTimeout since it does not have
  // the minimum 4ms penalty.
  // Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
  // Desktop to a lesser extent) that renders both setImmediate and
  // MessageChannel useless for the purposes of ASAP.
  // https://github.com/kriskowal/q/issues/396
  // Timers are implemented universally.
  // We fall back to timers in workers in most engines, and in foreground
  // contexts in the following browsers.
  // However, note that even this simple case requires nuances to operate in a
  // broad spectrum of browsers.
  //
  // - Firefox 3-13
  // - Internet Explorer 6-9
  // - iPad Safari 4.3
  // - Lynx 2.8.7
  makeRequestCallFromTimer
);
class AsapQueue {
  // Use the fastest means possible to execute a task in its own turn, with
  // priority over other events including IO, animation, reflow, and redraw
  // events in browsers.
  //
  // An exception thrown by a task will permanently interrupt the processing of
  // subsequent tasks. The higher level `asap` function ensures that if an
  // exception is thrown by a task, that the task queue will continue flushing as
  // soon as possible, but if you use `rawAsap` directly, you are responsible to
  // either ensure that no exceptions are thrown from your task, or to manually
  // call `rawAsap.requestFlush` if an exception is thrown.
  enqueueTask(task) {
    const {
      queue: q2,
      requestFlush
    } = this;
    if (!q2.length) {
      requestFlush();
      this.flushing = true;
    }
    q2[q2.length] = task;
  }
  constructor() {
    this.queue = [];
    this.pendingErrors = [];
    this.flushing = false;
    this.index = 0;
    this.capacity = 1024;
    this.flush = () => {
      const {
        queue: q2
      } = this;
      while (this.index < q2.length) {
        const currentIndex = this.index;
        this.index++;
        q2[currentIndex].call();
        if (this.index > this.capacity) {
          for (let scan = 0, newLength = q2.length - this.index; scan < newLength; scan++) {
            q2[scan] = q2[scan + this.index];
          }
          q2.length -= this.index;
          this.index = 0;
        }
      }
      q2.length = 0;
      this.index = 0;
      this.flushing = false;
    };
    this.registerPendingError = (err) => {
      this.pendingErrors.push(err);
      this.requestErrorThrow();
    };
    this.requestFlush = makeRequestCall(this.flush);
    this.requestErrorThrow = makeRequestCallFromTimer(() => {
      if (this.pendingErrors.length) {
        throw this.pendingErrors.shift();
      }
    });
  }
}
class RawTask {
  call() {
    try {
      this.task && this.task();
    } catch (error) {
      this.onError(error);
    } finally {
      this.task = null;
      this.release(this);
    }
  }
  constructor(onError, release) {
    this.onError = onError;
    this.release = release;
    this.task = null;
  }
}
class TaskFactory {
  create(task) {
    const tasks = this.freeTasks;
    const t1 = tasks.length ? tasks.pop() : new RawTask(this.onError, (t2) => tasks[tasks.length] = t2);
    t1.task = task;
    return t1;
  }
  constructor(onError) {
    this.onError = onError;
    this.freeTasks = [];
  }
}
const asapQueue = new AsapQueue();
const taskFactory = new TaskFactory(asapQueue.registerPendingError);
function asap(task) {
  asapQueue.enqueueTask(taskFactory.create(task));
}
function _classCallCheck$c(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$c(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$c(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$c(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$d(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _slicedToArray$6(arr, i2) {
  return _arrayWithHoles$6(arr) || _iterableToArrayLimit$6(arr, i2) || _unsupportedIterableToArray$7(arr, i2) || _nonIterableRest$6();
}
function _nonIterableRest$6() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$7(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$7(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$7(o2, minLen);
}
function _arrayLikeToArray$7(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit$6(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$6(arr) {
  if (Array.isArray(arr)) return arr;
}
function getNextHandlerId(role) {
  var id = getNextUniqueId().toString();
  switch (role) {
    case HandlerRole.SOURCE:
      return "S".concat(id);
    case HandlerRole.TARGET:
      return "T".concat(id);
    default:
      throw new Error("Unknown Handler Role: ".concat(role));
  }
}
function parseRoleFromHandlerId(handlerId) {
  switch (handlerId[0]) {
    case "S":
      return HandlerRole.SOURCE;
    case "T":
      return HandlerRole.TARGET;
    default:
      invariant(false, "Cannot parse handler ID: ".concat(handlerId));
  }
}
function mapContainsValue(map, searchValue) {
  var entries = map.entries();
  var isDone = false;
  do {
    var _entries$next = entries.next(), done = _entries$next.done, _entries$next$value = _slicedToArray$6(_entries$next.value, 2), value = _entries$next$value[1];
    if (value === searchValue) {
      return true;
    }
    isDone = !!done;
  } while (!isDone);
  return false;
}
var HandlerRegistryImpl = /* @__PURE__ */ (function() {
  function HandlerRegistryImpl2(store) {
    _classCallCheck$c(this, HandlerRegistryImpl2);
    _defineProperty$d(this, "types", /* @__PURE__ */ new Map());
    _defineProperty$d(this, "dragSources", /* @__PURE__ */ new Map());
    _defineProperty$d(this, "dropTargets", /* @__PURE__ */ new Map());
    _defineProperty$d(this, "pinnedSourceId", null);
    _defineProperty$d(this, "pinnedSource", null);
    _defineProperty$d(this, "store", void 0);
    this.store = store;
  }
  _createClass$c(HandlerRegistryImpl2, [{
    key: "addSource",
    value: function addSource$1(type, source) {
      validateType(type);
      validateSourceContract(source);
      var sourceId = this.addHandler(HandlerRole.SOURCE, type, source);
      this.store.dispatch(addSource(sourceId));
      return sourceId;
    }
  }, {
    key: "addTarget",
    value: function addTarget$1(type, target) {
      validateType(type, true);
      validateTargetContract(target);
      var targetId = this.addHandler(HandlerRole.TARGET, type, target);
      this.store.dispatch(addTarget(targetId));
      return targetId;
    }
  }, {
    key: "containsHandler",
    value: function containsHandler(handler2) {
      return mapContainsValue(this.dragSources, handler2) || mapContainsValue(this.dropTargets, handler2);
    }
  }, {
    key: "getSource",
    value: function getSource(sourceId) {
      var includePinned = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      invariant(this.isSourceId(sourceId), "Expected a valid source ID.");
      var isPinned = includePinned && sourceId === this.pinnedSourceId;
      var source = isPinned ? this.pinnedSource : this.dragSources.get(sourceId);
      return source;
    }
  }, {
    key: "getTarget",
    value: function getTarget2(targetId) {
      invariant(this.isTargetId(targetId), "Expected a valid target ID.");
      return this.dropTargets.get(targetId);
    }
  }, {
    key: "getSourceType",
    value: function getSourceType(sourceId) {
      invariant(this.isSourceId(sourceId), "Expected a valid source ID.");
      return this.types.get(sourceId);
    }
  }, {
    key: "getTargetType",
    value: function getTargetType(targetId) {
      invariant(this.isTargetId(targetId), "Expected a valid target ID.");
      return this.types.get(targetId);
    }
  }, {
    key: "isSourceId",
    value: function isSourceId(handlerId) {
      var role = parseRoleFromHandlerId(handlerId);
      return role === HandlerRole.SOURCE;
    }
  }, {
    key: "isTargetId",
    value: function isTargetId(handlerId) {
      var role = parseRoleFromHandlerId(handlerId);
      return role === HandlerRole.TARGET;
    }
  }, {
    key: "removeSource",
    value: function removeSource$1(sourceId) {
      var _this = this;
      invariant(this.getSource(sourceId), "Expected an existing source.");
      this.store.dispatch(removeSource(sourceId));
      asap(function() {
        _this.dragSources.delete(sourceId);
        _this.types.delete(sourceId);
      });
    }
  }, {
    key: "removeTarget",
    value: function removeTarget$1(targetId) {
      invariant(this.getTarget(targetId), "Expected an existing target.");
      this.store.dispatch(removeTarget(targetId));
      this.dropTargets.delete(targetId);
      this.types.delete(targetId);
    }
  }, {
    key: "pinSource",
    value: function pinSource(sourceId) {
      var source = this.getSource(sourceId);
      invariant(source, "Expected an existing source.");
      this.pinnedSourceId = sourceId;
      this.pinnedSource = source;
    }
  }, {
    key: "unpinSource",
    value: function unpinSource() {
      invariant(this.pinnedSource, "No source is pinned at the time.");
      this.pinnedSourceId = null;
      this.pinnedSource = null;
    }
  }, {
    key: "addHandler",
    value: function addHandler(role, type, handler2) {
      var id = getNextHandlerId(role);
      this.types.set(id, type);
      if (role === HandlerRole.SOURCE) {
        this.dragSources.set(id, handler2);
      } else if (role === HandlerRole.TARGET) {
        this.dropTargets.set(id, handler2);
      }
      return id;
    }
  }]);
  return HandlerRegistryImpl2;
})();
function createDragDropManager(backendFactory) {
  var globalContext = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
  var backendOptions = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  var debugMode = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
  var store = makeStoreInstance(debugMode);
  var monitor = new DragDropMonitorImpl(store, new HandlerRegistryImpl(store));
  var manager = new DragDropManagerImpl(store, monitor);
  var backend = backendFactory(manager, globalContext, backendOptions);
  manager.receiveBackend(backend);
  return manager;
}
function makeStoreInstance(debugMode) {
  var reduxDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__;
  return createStore$1(reduce, debugMode && reduxDevTools && reduxDevTools({
    name: "dnd-core",
    instanceId: "dnd-core"
  }));
}
var _excluded = ["children"];
function _slicedToArray$5(arr, i2) {
  return _arrayWithHoles$5(arr) || _iterableToArrayLimit$5(arr, i2) || _unsupportedIterableToArray$6(arr, i2) || _nonIterableRest$5();
}
function _nonIterableRest$5() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$6(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$6(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$6(o2, minLen);
}
function _arrayLikeToArray$6(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit$5(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$5(arr) {
  if (Array.isArray(arr)) return arr;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i2;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
      key = sourceSymbolKeys[i2];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
var refCount = 0;
var INSTANCE_SYM = /* @__PURE__ */ Symbol.for("__REACT_DND_CONTEXT_INSTANCE__");
var DndProvider = N$2(function DndProvider2(_ref) {
  var children = _ref.children, props = _objectWithoutProperties(_ref, _excluded);
  var _getDndContextValue = getDndContextValue(props), _getDndContextValue2 = _slicedToArray$5(_getDndContextValue, 2), manager = _getDndContextValue2[0], isGlobalInstance = _getDndContextValue2[1];
  y$4(function() {
    if (isGlobalInstance) {
      var context = getGlobalContext();
      ++refCount;
      return function() {
        if (--refCount === 0) {
          context[INSTANCE_SYM] = null;
        }
      };
    }
  }, []);
  return u$5(DndContext.Provider, Object.assign({
    value: manager
  }, {
    children
  }), void 0);
});
function getDndContextValue(props) {
  if ("manager" in props) {
    var _manager = {
      dragDropManager: props.manager
    };
    return [_manager, false];
  }
  var manager = createSingletonDndContext(props.backend, props.context, props.options, props.debugMode);
  var isGlobalInstance = !props.context;
  return [manager, isGlobalInstance];
}
function createSingletonDndContext(backend) {
  var context = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : getGlobalContext();
  var options2 = arguments.length > 2 ? arguments[2] : void 0;
  var debugMode = arguments.length > 3 ? arguments[3] : void 0;
  var ctx = context;
  if (!ctx[INSTANCE_SYM]) {
    ctx[INSTANCE_SYM] = {
      dragDropManager: createDragDropManager(backend, context, options2, debugMode)
    };
  }
  return ctx[INSTANCE_SYM];
}
function getGlobalContext() {
  return typeof global !== "undefined" ? global : window;
}
N$2(function DragPreviewImage(_ref) {
  var connect = _ref.connect, src = _ref.src;
  y$4(function() {
    if (typeof Image === "undefined") return;
    var connected = false;
    var img = new Image();
    img.src = src;
    img.onload = function() {
      connect(img);
      connected = true;
    };
    return function() {
      if (connected) {
        connect(null);
      }
    };
  });
  return null;
});
function _classCallCheck$b(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$b(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$b(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$b(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$c(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var isCallingCanDrag = false;
var isCallingIsDragging = false;
var DragSourceMonitorImpl = /* @__PURE__ */ (function() {
  function DragSourceMonitorImpl2(manager) {
    _classCallCheck$b(this, DragSourceMonitorImpl2);
    _defineProperty$c(this, "internalMonitor", void 0);
    _defineProperty$c(this, "sourceId", null);
    this.internalMonitor = manager.getMonitor();
  }
  _createClass$b(DragSourceMonitorImpl2, [{
    key: "receiveHandlerId",
    value: function receiveHandlerId(sourceId) {
      this.sourceId = sourceId;
    }
  }, {
    key: "getHandlerId",
    value: function getHandlerId() {
      return this.sourceId;
    }
  }, {
    key: "canDrag",
    value: function canDrag() {
      invariant(!isCallingCanDrag, "You may not call monitor.canDrag() inside your canDrag() implementation. Read more: http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor");
      try {
        isCallingCanDrag = true;
        return this.internalMonitor.canDragSource(this.sourceId);
      } finally {
        isCallingCanDrag = false;
      }
    }
  }, {
    key: "isDragging",
    value: function isDragging() {
      if (!this.sourceId) {
        return false;
      }
      invariant(!isCallingIsDragging, "You may not call monitor.isDragging() inside your isDragging() implementation. Read more: http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor");
      try {
        isCallingIsDragging = true;
        return this.internalMonitor.isDraggingSource(this.sourceId);
      } finally {
        isCallingIsDragging = false;
      }
    }
  }, {
    key: "subscribeToStateChange",
    value: function subscribeToStateChange(listener, options2) {
      return this.internalMonitor.subscribeToStateChange(listener, options2);
    }
  }, {
    key: "isDraggingSource",
    value: function isDraggingSource(sourceId) {
      return this.internalMonitor.isDraggingSource(sourceId);
    }
  }, {
    key: "isOverTarget",
    value: function isOverTarget(targetId, options2) {
      return this.internalMonitor.isOverTarget(targetId, options2);
    }
  }, {
    key: "getTargetIds",
    value: function getTargetIds() {
      return this.internalMonitor.getTargetIds();
    }
  }, {
    key: "isSourcePublic",
    value: function isSourcePublic() {
      return this.internalMonitor.isSourcePublic();
    }
  }, {
    key: "getSourceId",
    value: function getSourceId() {
      return this.internalMonitor.getSourceId();
    }
  }, {
    key: "subscribeToOffsetChange",
    value: function subscribeToOffsetChange(listener) {
      return this.internalMonitor.subscribeToOffsetChange(listener);
    }
  }, {
    key: "canDragSource",
    value: function canDragSource(sourceId) {
      return this.internalMonitor.canDragSource(sourceId);
    }
  }, {
    key: "canDropOnTarget",
    value: function canDropOnTarget(targetId) {
      return this.internalMonitor.canDropOnTarget(targetId);
    }
  }, {
    key: "getItemType",
    value: function getItemType() {
      return this.internalMonitor.getItemType();
    }
  }, {
    key: "getItem",
    value: function getItem() {
      return this.internalMonitor.getItem();
    }
  }, {
    key: "getDropResult",
    value: function getDropResult() {
      return this.internalMonitor.getDropResult();
    }
  }, {
    key: "didDrop",
    value: function didDrop() {
      return this.internalMonitor.didDrop();
    }
  }, {
    key: "getInitialClientOffset",
    value: function getInitialClientOffset() {
      return this.internalMonitor.getInitialClientOffset();
    }
  }, {
    key: "getInitialSourceClientOffset",
    value: function getInitialSourceClientOffset() {
      return this.internalMonitor.getInitialSourceClientOffset();
    }
  }, {
    key: "getSourceClientOffset",
    value: function getSourceClientOffset2() {
      return this.internalMonitor.getSourceClientOffset();
    }
  }, {
    key: "getClientOffset",
    value: function getClientOffset() {
      return this.internalMonitor.getClientOffset();
    }
  }, {
    key: "getDifferenceFromInitialOffset",
    value: function getDifferenceFromInitialOffset2() {
      return this.internalMonitor.getDifferenceFromInitialOffset();
    }
  }]);
  return DragSourceMonitorImpl2;
})();
function _classCallCheck$a(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$a(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$a(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$a(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$b(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var isCallingCanDrop = false;
var DropTargetMonitorImpl = /* @__PURE__ */ (function() {
  function DropTargetMonitorImpl2(manager) {
    _classCallCheck$a(this, DropTargetMonitorImpl2);
    _defineProperty$b(this, "internalMonitor", void 0);
    _defineProperty$b(this, "targetId", null);
    this.internalMonitor = manager.getMonitor();
  }
  _createClass$a(DropTargetMonitorImpl2, [{
    key: "receiveHandlerId",
    value: function receiveHandlerId(targetId) {
      this.targetId = targetId;
    }
  }, {
    key: "getHandlerId",
    value: function getHandlerId() {
      return this.targetId;
    }
  }, {
    key: "subscribeToStateChange",
    value: function subscribeToStateChange(listener, options2) {
      return this.internalMonitor.subscribeToStateChange(listener, options2);
    }
  }, {
    key: "canDrop",
    value: function canDrop() {
      if (!this.targetId) {
        return false;
      }
      invariant(!isCallingCanDrop, "You may not call monitor.canDrop() inside your canDrop() implementation. Read more: http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor");
      try {
        isCallingCanDrop = true;
        return this.internalMonitor.canDropOnTarget(this.targetId);
      } finally {
        isCallingCanDrop = false;
      }
    }
  }, {
    key: "isOver",
    value: function isOver(options2) {
      if (!this.targetId) {
        return false;
      }
      return this.internalMonitor.isOverTarget(this.targetId, options2);
    }
  }, {
    key: "getItemType",
    value: function getItemType() {
      return this.internalMonitor.getItemType();
    }
  }, {
    key: "getItem",
    value: function getItem() {
      return this.internalMonitor.getItem();
    }
  }, {
    key: "getDropResult",
    value: function getDropResult() {
      return this.internalMonitor.getDropResult();
    }
  }, {
    key: "didDrop",
    value: function didDrop() {
      return this.internalMonitor.didDrop();
    }
  }, {
    key: "getInitialClientOffset",
    value: function getInitialClientOffset() {
      return this.internalMonitor.getInitialClientOffset();
    }
  }, {
    key: "getInitialSourceClientOffset",
    value: function getInitialSourceClientOffset() {
      return this.internalMonitor.getInitialSourceClientOffset();
    }
  }, {
    key: "getSourceClientOffset",
    value: function getSourceClientOffset2() {
      return this.internalMonitor.getSourceClientOffset();
    }
  }, {
    key: "getClientOffset",
    value: function getClientOffset() {
      return this.internalMonitor.getClientOffset();
    }
  }, {
    key: "getDifferenceFromInitialOffset",
    value: function getDifferenceFromInitialOffset2() {
      return this.internalMonitor.getDifferenceFromInitialOffset();
    }
  }]);
  return DropTargetMonitorImpl2;
})();
function throwIfCompositeComponentElement(element) {
  if (typeof element.type === "string") {
    return;
  }
  var displayName = element.type.displayName || element.type.name || "the component";
  throw new Error("Only native element nodes can now be passed to React DnD connectors." + "You can either wrap ".concat(displayName, " into a <div>, or turn it into a ") + "drag source or a drop target itself.");
}
function wrapHookToRecognizeElement(hook) {
  return function() {
    var elementOrNode = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
    var options2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    if (!hn$1(elementOrNode)) {
      var node = elementOrNode;
      hook(node, options2);
      return node;
    }
    var element = elementOrNode;
    throwIfCompositeComponentElement(element);
    var ref = options2 ? function(node2) {
      return hook(node2, options2);
    } : hook;
    return cloneWithRef(element, ref);
  };
}
function wrapConnectorHooks(hooks) {
  var wrappedHooks = {};
  Object.keys(hooks).forEach(function(key) {
    var hook = hooks[key];
    if (key.endsWith("Ref")) {
      wrappedHooks[key] = hooks[key];
    } else {
      var wrappedHook = wrapHookToRecognizeElement(hook);
      wrappedHooks[key] = function() {
        return wrappedHook;
      };
    }
  });
  return wrappedHooks;
}
function setRef(ref, node) {
  if (typeof ref === "function") {
    ref(node);
  } else {
    ref.current = node;
  }
}
function cloneWithRef(element, newRef) {
  var previousRef = element.ref;
  invariant(typeof previousRef !== "string", "Cannot connect React DnD to an element with an existing string ref. Please convert it to use a callback ref instead, or wrap it into a <span> or <div>. Read more: https://reactjs.org/docs/refs-and-the-dom.html#callback-refs");
  if (!previousRef) {
    return mn$1(element, {
      ref: newRef
    });
  } else {
    return mn$1(element, {
      ref: function ref(node) {
        setRef(previousRef, node);
        setRef(newRef, node);
      }
    });
  }
}
function _typeof$1(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof$1 = function _typeof2(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof$1 = function _typeof2(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof$1(obj);
}
function isRef(obj) {
  return (
    // eslint-disable-next-line no-prototype-builtins
    obj !== null && _typeof$1(obj) === "object" && Object.prototype.hasOwnProperty.call(obj, "current")
  );
}
function shallowEqual(objA, objB, compare, compareContext) {
  var compareResult = void 0;
  if (compareResult !== void 0) {
    return !!compareResult;
  }
  if (objA === objB) {
    return true;
  }
  if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
    return false;
  }
  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];
    if (!bHasOwnProperty(key)) {
      return false;
    }
    var valueA = objA[key];
    var valueB = objB[key];
    compareResult = void 0;
    if (compareResult === false || compareResult === void 0 && valueA !== valueB) {
      return false;
    }
  }
  return true;
}
function _classCallCheck$9(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$9(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$9(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$9(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$a(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var SourceConnector = /* @__PURE__ */ (function() {
  function SourceConnector2(backend) {
    var _this = this;
    _classCallCheck$9(this, SourceConnector2);
    _defineProperty$a(this, "hooks", wrapConnectorHooks({
      dragSource: function dragSource(node, options2) {
        _this.clearDragSource();
        _this.dragSourceOptions = options2 || null;
        if (isRef(node)) {
          _this.dragSourceRef = node;
        } else {
          _this.dragSourceNode = node;
        }
        _this.reconnectDragSource();
      },
      dragPreview: function dragPreview(node, options2) {
        _this.clearDragPreview();
        _this.dragPreviewOptions = options2 || null;
        if (isRef(node)) {
          _this.dragPreviewRef = node;
        } else {
          _this.dragPreviewNode = node;
        }
        _this.reconnectDragPreview();
      }
    }));
    _defineProperty$a(this, "handlerId", null);
    _defineProperty$a(this, "dragSourceRef", null);
    _defineProperty$a(this, "dragSourceNode", void 0);
    _defineProperty$a(this, "dragSourceOptionsInternal", null);
    _defineProperty$a(this, "dragSourceUnsubscribe", void 0);
    _defineProperty$a(this, "dragPreviewRef", null);
    _defineProperty$a(this, "dragPreviewNode", void 0);
    _defineProperty$a(this, "dragPreviewOptionsInternal", null);
    _defineProperty$a(this, "dragPreviewUnsubscribe", void 0);
    _defineProperty$a(this, "lastConnectedHandlerId", null);
    _defineProperty$a(this, "lastConnectedDragSource", null);
    _defineProperty$a(this, "lastConnectedDragSourceOptions", null);
    _defineProperty$a(this, "lastConnectedDragPreview", null);
    _defineProperty$a(this, "lastConnectedDragPreviewOptions", null);
    _defineProperty$a(this, "backend", void 0);
    this.backend = backend;
  }
  _createClass$9(SourceConnector2, [{
    key: "receiveHandlerId",
    value: function receiveHandlerId(newHandlerId) {
      if (this.handlerId === newHandlerId) {
        return;
      }
      this.handlerId = newHandlerId;
      this.reconnect();
    }
  }, {
    key: "connectTarget",
    get: function get2() {
      return this.dragSource;
    }
  }, {
    key: "dragSourceOptions",
    get: function get2() {
      return this.dragSourceOptionsInternal;
    },
    set: function set(options2) {
      this.dragSourceOptionsInternal = options2;
    }
  }, {
    key: "dragPreviewOptions",
    get: function get2() {
      return this.dragPreviewOptionsInternal;
    },
    set: function set(options2) {
      this.dragPreviewOptionsInternal = options2;
    }
  }, {
    key: "reconnect",
    value: function reconnect() {
      this.reconnectDragSource();
      this.reconnectDragPreview();
    }
  }, {
    key: "reconnectDragSource",
    value: function reconnectDragSource() {
      var dragSource = this.dragSource;
      var didChange2 = this.didHandlerIdChange() || this.didConnectedDragSourceChange() || this.didDragSourceOptionsChange();
      if (didChange2) {
        this.disconnectDragSource();
      }
      if (!this.handlerId) {
        return;
      }
      if (!dragSource) {
        this.lastConnectedDragSource = dragSource;
        return;
      }
      if (didChange2) {
        this.lastConnectedHandlerId = this.handlerId;
        this.lastConnectedDragSource = dragSource;
        this.lastConnectedDragSourceOptions = this.dragSourceOptions;
        this.dragSourceUnsubscribe = this.backend.connectDragSource(this.handlerId, dragSource, this.dragSourceOptions);
      }
    }
  }, {
    key: "reconnectDragPreview",
    value: function reconnectDragPreview() {
      var dragPreview = this.dragPreview;
      var didChange2 = this.didHandlerIdChange() || this.didConnectedDragPreviewChange() || this.didDragPreviewOptionsChange();
      if (didChange2) {
        this.disconnectDragPreview();
      }
      if (!this.handlerId) {
        return;
      }
      if (!dragPreview) {
        this.lastConnectedDragPreview = dragPreview;
        return;
      }
      if (didChange2) {
        this.lastConnectedHandlerId = this.handlerId;
        this.lastConnectedDragPreview = dragPreview;
        this.lastConnectedDragPreviewOptions = this.dragPreviewOptions;
        this.dragPreviewUnsubscribe = this.backend.connectDragPreview(this.handlerId, dragPreview, this.dragPreviewOptions);
      }
    }
  }, {
    key: "didHandlerIdChange",
    value: function didHandlerIdChange() {
      return this.lastConnectedHandlerId !== this.handlerId;
    }
  }, {
    key: "didConnectedDragSourceChange",
    value: function didConnectedDragSourceChange() {
      return this.lastConnectedDragSource !== this.dragSource;
    }
  }, {
    key: "didConnectedDragPreviewChange",
    value: function didConnectedDragPreviewChange() {
      return this.lastConnectedDragPreview !== this.dragPreview;
    }
  }, {
    key: "didDragSourceOptionsChange",
    value: function didDragSourceOptionsChange() {
      return !shallowEqual(this.lastConnectedDragSourceOptions, this.dragSourceOptions);
    }
  }, {
    key: "didDragPreviewOptionsChange",
    value: function didDragPreviewOptionsChange() {
      return !shallowEqual(this.lastConnectedDragPreviewOptions, this.dragPreviewOptions);
    }
  }, {
    key: "disconnectDragSource",
    value: function disconnectDragSource() {
      if (this.dragSourceUnsubscribe) {
        this.dragSourceUnsubscribe();
        this.dragSourceUnsubscribe = void 0;
      }
    }
  }, {
    key: "disconnectDragPreview",
    value: function disconnectDragPreview() {
      if (this.dragPreviewUnsubscribe) {
        this.dragPreviewUnsubscribe();
        this.dragPreviewUnsubscribe = void 0;
        this.dragPreviewNode = null;
        this.dragPreviewRef = null;
      }
    }
  }, {
    key: "dragSource",
    get: function get2() {
      return this.dragSourceNode || this.dragSourceRef && this.dragSourceRef.current;
    }
  }, {
    key: "dragPreview",
    get: function get2() {
      return this.dragPreviewNode || this.dragPreviewRef && this.dragPreviewRef.current;
    }
  }, {
    key: "clearDragSource",
    value: function clearDragSource() {
      this.dragSourceNode = null;
      this.dragSourceRef = null;
    }
  }, {
    key: "clearDragPreview",
    value: function clearDragPreview() {
      this.dragPreviewNode = null;
      this.dragPreviewRef = null;
    }
  }]);
  return SourceConnector2;
})();
function _classCallCheck$8(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$8(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$8(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$8(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$9(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var TargetConnector = /* @__PURE__ */ (function() {
  function TargetConnector2(backend) {
    var _this = this;
    _classCallCheck$8(this, TargetConnector2);
    _defineProperty$9(this, "hooks", wrapConnectorHooks({
      dropTarget: function dropTarget(node, options2) {
        _this.clearDropTarget();
        _this.dropTargetOptions = options2;
        if (isRef(node)) {
          _this.dropTargetRef = node;
        } else {
          _this.dropTargetNode = node;
        }
        _this.reconnect();
      }
    }));
    _defineProperty$9(this, "handlerId", null);
    _defineProperty$9(this, "dropTargetRef", null);
    _defineProperty$9(this, "dropTargetNode", void 0);
    _defineProperty$9(this, "dropTargetOptionsInternal", null);
    _defineProperty$9(this, "unsubscribeDropTarget", void 0);
    _defineProperty$9(this, "lastConnectedHandlerId", null);
    _defineProperty$9(this, "lastConnectedDropTarget", null);
    _defineProperty$9(this, "lastConnectedDropTargetOptions", null);
    _defineProperty$9(this, "backend", void 0);
    this.backend = backend;
  }
  _createClass$8(TargetConnector2, [{
    key: "connectTarget",
    get: function get2() {
      return this.dropTarget;
    }
  }, {
    key: "reconnect",
    value: function reconnect() {
      var didChange2 = this.didHandlerIdChange() || this.didDropTargetChange() || this.didOptionsChange();
      if (didChange2) {
        this.disconnectDropTarget();
      }
      var dropTarget = this.dropTarget;
      if (!this.handlerId) {
        return;
      }
      if (!dropTarget) {
        this.lastConnectedDropTarget = dropTarget;
        return;
      }
      if (didChange2) {
        this.lastConnectedHandlerId = this.handlerId;
        this.lastConnectedDropTarget = dropTarget;
        this.lastConnectedDropTargetOptions = this.dropTargetOptions;
        this.unsubscribeDropTarget = this.backend.connectDropTarget(this.handlerId, dropTarget, this.dropTargetOptions);
      }
    }
  }, {
    key: "receiveHandlerId",
    value: function receiveHandlerId(newHandlerId) {
      if (newHandlerId === this.handlerId) {
        return;
      }
      this.handlerId = newHandlerId;
      this.reconnect();
    }
  }, {
    key: "dropTargetOptions",
    get: function get2() {
      return this.dropTargetOptionsInternal;
    },
    set: function set(options2) {
      this.dropTargetOptionsInternal = options2;
    }
  }, {
    key: "didHandlerIdChange",
    value: function didHandlerIdChange() {
      return this.lastConnectedHandlerId !== this.handlerId;
    }
  }, {
    key: "didDropTargetChange",
    value: function didDropTargetChange() {
      return this.lastConnectedDropTarget !== this.dropTarget;
    }
  }, {
    key: "didOptionsChange",
    value: function didOptionsChange() {
      return !shallowEqual(this.lastConnectedDropTargetOptions, this.dropTargetOptions);
    }
  }, {
    key: "disconnectDropTarget",
    value: function disconnectDropTarget() {
      if (this.unsubscribeDropTarget) {
        this.unsubscribeDropTarget();
        this.unsubscribeDropTarget = void 0;
      }
    }
  }, {
    key: "dropTarget",
    get: function get2() {
      return this.dropTargetNode || this.dropTargetRef && this.dropTargetRef.current;
    }
  }, {
    key: "clearDropTarget",
    value: function clearDropTarget() {
      this.dropTargetRef = null;
      this.dropTargetNode = null;
    }
  }]);
  return TargetConnector2;
})();
function registerTarget(type, target, manager) {
  var registry = manager.getRegistry();
  var targetId = registry.addTarget(type, target);
  return [targetId, function() {
    return registry.removeTarget(targetId);
  }];
}
function registerSource(type, source, manager) {
  var registry = manager.getRegistry();
  var sourceId = registry.addSource(type, source);
  return [sourceId, function() {
    return registry.removeSource(sourceId);
  }];
}
function isFunction(input) {
  return typeof input === "function";
}
function noop$1() {
}
function _classCallCheck$7(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$7(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$7(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$7(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$7(Constructor, staticProps);
  return Constructor;
}
function _defineProperty$8(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var Disposable = /* @__PURE__ */ (function() {
  function Disposable2(action) {
    _classCallCheck$7(this, Disposable2);
    _defineProperty$8(this, "isDisposed", false);
    _defineProperty$8(this, "action", void 0);
    this.action = isFunction(action) ? action : noop$1;
  }
  _createClass$7(Disposable2, [{
    key: "dispose",
    value: function dispose() {
      if (!this.isDisposed) {
        this.action();
        this.isDisposed = true;
      }
    }
  }], [{
    key: "isDisposable",
    value: (
      /**
       * Gets the disposable that does nothing when disposed.
       */
      /**
       * Validates whether the given object is a disposable
       * @param {Object} Object to test whether it has a dispose method
       * @returns {Boolean} true if a disposable object, else false.
       */
      function isDisposable(d2) {
        return Boolean(d2 && isFunction(d2.dispose));
      }
    )
  }, {
    key: "_fixup",
    value: function _fixup(result) {
      return Disposable2.isDisposable(result) ? result : Disposable2.empty;
    }
    /**
     * Creates a disposable object that invokes the specified action when disposed.
     * @param {Function} dispose Action to run during the first call to dispose.
     * The action is guaranteed to be run at most once.
     * @return {Disposable} The disposable object that runs the given action upon disposal.
     */
  }, {
    key: "create",
    value: function create2(action) {
      return new Disposable2(action);
    }
  }]);
  return Disposable2;
})();
_defineProperty$8(Disposable, "empty", {
  dispose: noop$1
});
var exports$8 = {};
Object.defineProperty(exports$8, "__esModule", {
  value: true
});
var b = "function" === typeof Symbol && Symbol.for, c = b ? /* @__PURE__ */ Symbol.for("react.element") : 60103, d = b ? /* @__PURE__ */ Symbol.for("react.portal") : 60106, e = b ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107, f$1 = b ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108, g = b ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114, h = b ? /* @__PURE__ */ Symbol.for("react.provider") : 60109, k = b ? /* @__PURE__ */ Symbol.for("react.context") : 60110, l = b ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111, m = b ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111, n = b ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112, p = b ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113, q = b ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120, r = b ? /* @__PURE__ */ Symbol.for("react.memo") : 60115, t = b ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116, v = b ? /* @__PURE__ */ Symbol.for("react.block") : 60121, w = b ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117, x = b ? /* @__PURE__ */ Symbol.for("react.responder") : 60118, y = b ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
function z(a2) {
  if ("object" === typeof a2 && null !== a2) {
    var u2 = a2.$$typeof;
    switch (u2) {
      case c:
        switch (a2 = a2.type, a2) {
          case l:
          case m:
          case e:
          case g:
          case f$1:
          case p:
            return a2;
          default:
            switch (a2 = a2 && a2.$$typeof, a2) {
              case k:
              case n:
              case t:
              case r:
              case h:
                return a2;
              default:
                return u2;
            }
        }
      case d:
        return u2;
    }
  }
}
function A(a2) {
  return z(a2) === m;
}
exports$8.AsyncMode = l;
exports$8.ConcurrentMode = m;
exports$8.ContextConsumer = k;
exports$8.ContextProvider = h;
exports$8.Element = c;
exports$8.ForwardRef = n;
exports$8.Fragment = e;
exports$8.Lazy = t;
exports$8.Memo = r;
exports$8.Portal = d;
exports$8.Profiler = g;
exports$8.StrictMode = f$1;
exports$8.Suspense = p;
exports$8.isAsyncMode = function(a2) {
  return A(a2) || z(a2) === l;
};
exports$8.isConcurrentMode = A;
exports$8.isContextConsumer = function(a2) {
  return z(a2) === k;
};
exports$8.isContextProvider = function(a2) {
  return z(a2) === h;
};
exports$8.isElement = function(a2) {
  return "object" === typeof a2 && null !== a2 && a2.$$typeof === c;
};
exports$8.isForwardRef = function(a2) {
  return z(a2) === n;
};
exports$8.isFragment = function(a2) {
  return z(a2) === e;
};
exports$8.isLazy = function(a2) {
  return z(a2) === t;
};
exports$8.isMemo = function(a2) {
  return z(a2) === r;
};
exports$8.isPortal = function(a2) {
  return z(a2) === d;
};
exports$8.isProfiler = function(a2) {
  return z(a2) === g;
};
exports$8.isStrictMode = function(a2) {
  return z(a2) === f$1;
};
exports$8.isSuspense = function(a2) {
  return z(a2) === p;
};
exports$8.isValidElementType = function(a2) {
  return "string" === typeof a2 || "function" === typeof a2 || a2 === e || a2 === m || a2 === g || a2 === f$1 || a2 === p || a2 === q || "object" === typeof a2 && null !== a2 && (a2.$$typeof === t || a2.$$typeof === r || a2.$$typeof === h || a2.$$typeof === k || a2.$$typeof === n || a2.$$typeof === w || a2.$$typeof === x || a2.$$typeof === y || a2.$$typeof === v);
};
exports$8.typeOf = z;
var _AsyncMode = exports$8.AsyncMode;
var _ConcurrentMode = exports$8.ConcurrentMode;
var _ContextConsumer = exports$8.ContextConsumer;
var _ContextProvider = exports$8.ContextProvider;
var _Element = exports$8.Element;
var _ForwardRef = exports$8.ForwardRef;
var _Fragment = exports$8.Fragment;
var _Lazy = exports$8.Lazy;
var _Memo = exports$8.Memo;
var _Portal = exports$8.Portal;
var _Profiler = exports$8.Profiler;
var _StrictMode = exports$8.StrictMode;
var _Suspense = exports$8.Suspense;
var _isAsyncMode = exports$8.isAsyncMode;
var _isConcurrentMode = exports$8.isConcurrentMode;
var _isContextConsumer = exports$8.isContextConsumer;
var _isContextProvider = exports$8.isContextProvider;
var _isElement = exports$8.isElement;
var _isForwardRef = exports$8.isForwardRef;
var _isFragment = exports$8.isFragment;
var _isLazy = exports$8.isLazy;
var _isMemo = exports$8.isMemo;
var _isPortal = exports$8.isPortal;
var _isProfiler = exports$8.isProfiler;
var _isStrictMode = exports$8.isStrictMode;
var _isSuspense = exports$8.isSuspense;
var _isValidElementType = exports$8.isValidElementType;
var _typeOf = exports$8.typeOf;
var _default$5;
if (typeof exports$8 === "object" && exports$8 !== null && "default" in exports$8) {
  _default$5 = exports$8.default;
} else {
  _default$5 = exports$8;
}
const _default_default$4 = _default$5;
var __require$4 = exports$8;
const _mod$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AsyncMode: _AsyncMode,
  ConcurrentMode: _ConcurrentMode,
  ContextConsumer: _ContextConsumer,
  ContextProvider: _ContextProvider,
  Element: _Element,
  ForwardRef: _ForwardRef,
  Fragment: _Fragment,
  Lazy: _Lazy,
  Memo: _Memo,
  Portal: _Portal,
  Profiler: _Profiler,
  StrictMode: _StrictMode,
  Suspense: _Suspense,
  __require: __require$4,
  default: _default_default$4,
  isAsyncMode: _isAsyncMode,
  isConcurrentMode: _isConcurrentMode,
  isContextConsumer: _isContextConsumer,
  isContextProvider: _isContextProvider,
  isElement: _isElement,
  isForwardRef: _isForwardRef,
  isFragment: _isFragment,
  isLazy: _isLazy,
  isMemo: _isMemo,
  isPortal: _isPortal,
  isProfiler: _isProfiler,
  isStrictMode: _isStrictMode,
  isSuspense: _isSuspense,
  isValidElementType: _isValidElementType,
  typeOf: _typeOf
}, Symbol.toStringTag, { value: "Module" }));
var exports$7 = {}, module$5 = {};
Object.defineProperty(module$5, "exports", {
  get() {
    return exports$7;
  },
  set(value) {
    exports$7 = value;
  }
});
Object.defineProperty(exports$7, "__esModule", {
  value: true
});
module$5.exports = _mod$3;
var _default$4;
if (typeof exports$7 === "object" && exports$7 !== null && "default" in exports$7) {
  _default$4 = exports$7.default;
} else {
  _default$4 = exports$7;
}
const _default_default$3 = _default$4;
var __require$3 = exports$7;
const _mod$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AsyncMode: _AsyncMode,
  ConcurrentMode: _ConcurrentMode,
  ContextConsumer: _ContextConsumer,
  ContextProvider: _ContextProvider,
  Element: _Element,
  ForwardRef: _ForwardRef,
  Fragment: _Fragment,
  Lazy: _Lazy,
  Memo: _Memo,
  Portal: _Portal,
  Profiler: _Profiler,
  StrictMode: _StrictMode,
  Suspense: _Suspense,
  __require: __require$3,
  default: _default_default$3,
  isAsyncMode: _isAsyncMode,
  isConcurrentMode: _isConcurrentMode,
  isContextConsumer: _isContextConsumer,
  isContextProvider: _isContextProvider,
  isElement: _isElement,
  isForwardRef: _isForwardRef,
  isFragment: _isFragment,
  isLazy: _isLazy,
  isMemo: _isMemo,
  isPortal: _isPortal,
  isProfiler: _isProfiler,
  isStrictMode: _isStrictMode,
  isSuspense: _isSuspense,
  isValidElementType: _isValidElementType,
  typeOf: _typeOf
}, Symbol.toStringTag, { value: "Module" }));
var exports$6 = {}, module$4 = {};
Object.defineProperty(module$4, "exports", {
  get() {
    return exports$6;
  },
  set(value) {
    exports$6 = value;
  }
});
Object.defineProperty(exports$6, "__esModule", {
  value: true
});
var reactIs = __require$3 ?? _default_default$3 ?? _mod$2;
var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  "$$typeof": true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  "$$typeof": true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {};
TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
function getStatics(component) {
  if (reactIs.isMemo(component)) {
    return MEMO_STATICS;
  }
  return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
}
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== "string") {
    if (objectPrototype) {
      var inheritedComponent = getPrototypeOf(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }
    var keys = getOwnPropertyNames(sourceComponent);
    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }
    var targetStatics = getStatics(targetComponent);
    var sourceStatics = getStatics(sourceComponent);
    for (var i2 = 0; i2 < keys.length; ++i2) {
      var key = keys[i2];
      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
        try {
          defineProperty(targetComponent, key, descriptor);
        } catch (e2) {
        }
      }
    }
  }
  return targetComponent;
}
module$4.exports = hoistNonReactStatics;
if (typeof exports$6 === "object" && exports$6 !== null && "default" in exports$6) {
  exports$6.default;
}
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? _$3 : y$4;
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof2(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function _typeof2(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function _classCallCheck$6(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$6(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$6(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$6(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$7(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var DragSourceImpl = /* @__PURE__ */ (function() {
  function DragSourceImpl2(spec, monitor, connector) {
    _classCallCheck$6(this, DragSourceImpl2);
    _defineProperty$7(this, "spec", void 0);
    _defineProperty$7(this, "monitor", void 0);
    _defineProperty$7(this, "connector", void 0);
    this.spec = spec;
    this.monitor = monitor;
    this.connector = connector;
  }
  _createClass$6(DragSourceImpl2, [{
    key: "beginDrag",
    value: function beginDrag() {
      var _result;
      var spec = this.spec;
      var monitor = this.monitor;
      var result = null;
      if (_typeof(spec.item) === "object") {
        result = spec.item;
      } else if (typeof spec.item === "function") {
        result = spec.item(monitor);
      } else {
        result = {};
      }
      return (_result = result) !== null && _result !== void 0 ? _result : null;
    }
  }, {
    key: "canDrag",
    value: function canDrag() {
      var spec = this.spec;
      var monitor = this.monitor;
      if (typeof spec.canDrag === "boolean") {
        return spec.canDrag;
      } else if (typeof spec.canDrag === "function") {
        return spec.canDrag(monitor);
      } else {
        return true;
      }
    }
  }, {
    key: "isDragging",
    value: function isDragging(globalMonitor, target) {
      var spec = this.spec;
      var monitor = this.monitor;
      var isDragging2 = spec.isDragging;
      return isDragging2 ? isDragging2(monitor) : target === globalMonitor.getSourceId();
    }
  }, {
    key: "endDrag",
    value: function endDrag() {
      var spec = this.spec;
      var monitor = this.monitor;
      var connector = this.connector;
      var end = spec.end;
      if (end) {
        end(monitor.getItem(), monitor);
      }
      connector.reconnect();
    }
  }]);
  return DragSourceImpl2;
})();
function useDragSource(spec, monitor, connector) {
  var handler2 = T$4(function() {
    return new DragSourceImpl(spec, monitor, connector);
  }, [monitor, connector]);
  y$4(function() {
    handler2.spec = spec;
  }, [spec]);
  return handler2;
}
function useDragDropManager() {
  var _useContext = x$6(DndContext), dragDropManager = _useContext.dragDropManager;
  invariant(dragDropManager != null, "Expected drag drop context");
  return dragDropManager;
}
function useDragType(spec) {
  return T$4(function() {
    var result = spec.type;
    invariant(result != null, "spec.type must be defined");
    return result;
  }, [spec]);
}
function _slicedToArray$4(arr, i2) {
  return _arrayWithHoles$4(arr) || _iterableToArrayLimit$4(arr, i2) || _unsupportedIterableToArray$5(arr, i2) || _nonIterableRest$4();
}
function _nonIterableRest$4() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$5(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$5(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$5(o2, minLen);
}
function _arrayLikeToArray$5(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit$4(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$4(arr) {
  if (Array.isArray(arr)) return arr;
}
function useRegisteredDragSource(spec, monitor, connector) {
  var manager = useDragDropManager();
  var handler2 = useDragSource(spec, monitor, connector);
  var itemType = useDragType(spec);
  useIsomorphicLayoutEffect(function registerDragSource() {
    if (itemType != null) {
      var _registerSource = registerSource(itemType, handler2, manager), _registerSource2 = _slicedToArray$4(_registerSource, 2), handlerId = _registerSource2[0], unregister = _registerSource2[1];
      monitor.receiveHandlerId(handlerId);
      connector.receiveHandlerId(handlerId);
      return unregister;
    }
  }, [manager, monitor, connector, handler2, itemType]);
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray$4(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$4(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$4(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$4(o2, minLen);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$4(arr);
}
function _arrayLikeToArray$4(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function useOptionalFactory(arg, deps) {
  var memoDeps = _toConsumableArray(deps || []);
  if (deps == null && typeof arg !== "function") {
    memoDeps.push(arg);
  }
  return T$4(function() {
    return typeof arg === "function" ? arg() : arg;
  }, memoDeps);
}
function useDragSourceMonitor() {
  var manager = useDragDropManager();
  return T$4(function() {
    return new DragSourceMonitorImpl(manager);
  }, [manager]);
}
function useDragSourceConnector(dragSourceOptions, dragPreviewOptions) {
  var manager = useDragDropManager();
  var connector = T$4(function() {
    return new SourceConnector(manager.getBackend());
  }, [manager]);
  useIsomorphicLayoutEffect(function() {
    connector.dragSourceOptions = dragSourceOptions || null;
    connector.reconnect();
    return function() {
      return connector.disconnectDragSource();
    };
  }, [connector, dragSourceOptions]);
  useIsomorphicLayoutEffect(function() {
    connector.dragPreviewOptions = dragPreviewOptions || null;
    connector.reconnect();
    return function() {
      return connector.disconnectDragPreview();
    };
  }, [connector, dragPreviewOptions]);
  return connector;
}
var exports$5 = {}, module$3 = {};
Object.defineProperty(module$3, "exports", {
  get() {
    return exports$5;
  },
  set(value) {
    exports$5 = value;
  }
});
Object.defineProperty(exports$5, "__esModule", {
  value: true
});
module$3.exports = function equal(a2, b2) {
  if (a2 === b2) return true;
  if (a2 && b2 && typeof a2 == "object" && typeof b2 == "object") {
    if (a2.constructor !== b2.constructor) return false;
    var length, i2, keys;
    if (Array.isArray(a2)) {
      length = a2.length;
      if (length != b2.length) return false;
      for (i2 = length; i2-- !== 0; ) if (!equal(a2[i2], b2[i2])) return false;
      return true;
    }
    if (a2.constructor === RegExp) return a2.source === b2.source && a2.flags === b2.flags;
    if (a2.valueOf !== Object.prototype.valueOf) return a2.valueOf() === b2.valueOf();
    if (a2.toString !== Object.prototype.toString) return a2.toString() === b2.toString();
    keys = Object.keys(a2);
    length = keys.length;
    if (length !== Object.keys(b2).length) return false;
    for (i2 = length; i2-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b2, keys[i2])) return false;
    for (i2 = length; i2-- !== 0; ) {
      var key = keys[i2];
      if (!equal(a2[key], b2[key])) return false;
    }
    return true;
  }
  return a2 !== a2 && b2 !== b2;
};
var _default$3;
if (typeof exports$5 === "object" && exports$5 !== null && "default" in exports$5) {
  _default$3 = exports$5.default;
} else {
  _default$3 = exports$5;
}
const equal2 = _default$3;
function _slicedToArray$3(arr, i2) {
  return _arrayWithHoles$3(arr) || _iterableToArrayLimit$3(arr, i2) || _unsupportedIterableToArray$3(arr, i2) || _nonIterableRest$3();
}
function _nonIterableRest$3() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$3(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$3(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$3(o2, minLen);
}
function _arrayLikeToArray$3(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit$3(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$3(arr) {
  if (Array.isArray(arr)) return arr;
}
function useCollector(monitor, collect, onUpdate) {
  var _useState = d$4(function() {
    return collect(monitor);
  }), _useState2 = _slicedToArray$3(_useState, 2), collected = _useState2[0], setCollected = _useState2[1];
  var updateCollected = q$6(function() {
    var nextValue = collect(monitor);
    if (!equal2(collected, nextValue)) {
      setCollected(nextValue);
      if (onUpdate) {
        onUpdate();
      }
    }
  }, [collected, monitor, onUpdate]);
  useIsomorphicLayoutEffect(updateCollected);
  return [collected, updateCollected];
}
function _slicedToArray$2(arr, i2) {
  return _arrayWithHoles$2(arr) || _iterableToArrayLimit$2(arr, i2) || _unsupportedIterableToArray$2(arr, i2) || _nonIterableRest$2();
}
function _nonIterableRest$2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$2(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$2(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$2(o2, minLen);
}
function _arrayLikeToArray$2(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit$2(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$2(arr) {
  if (Array.isArray(arr)) return arr;
}
function useMonitorOutput(monitor, collect, onCollect) {
  var _useCollector = useCollector(monitor, collect, onCollect), _useCollector2 = _slicedToArray$2(_useCollector, 2), collected = _useCollector2[0], updateCollected = _useCollector2[1];
  useIsomorphicLayoutEffect(function subscribeToMonitorStateChange() {
    var handlerId = monitor.getHandlerId();
    if (handlerId == null) {
      return;
    }
    return monitor.subscribeToStateChange(updateCollected, {
      handlerIds: [handlerId]
    });
  }, [monitor, updateCollected]);
  return collected;
}
function useCollectedProps(collector, monitor, connector) {
  return useMonitorOutput(monitor, collector || function() {
    return {};
  }, function() {
    return connector.reconnect();
  });
}
function useConnectDragSource(connector) {
  return T$4(function() {
    return connector.hooks.dragSource();
  }, [connector]);
}
function useConnectDragPreview(connector) {
  return T$4(function() {
    return connector.hooks.dragPreview();
  }, [connector]);
}
function useDrag(specArg, deps) {
  var spec = useOptionalFactory(specArg, deps);
  invariant(!spec.begin, "useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)");
  var monitor = useDragSourceMonitor();
  var connector = useDragSourceConnector(spec.options, spec.previewOptions);
  useRegisteredDragSource(spec, monitor, connector);
  return [useCollectedProps(spec.collect, monitor, connector), useConnectDragSource(connector), useConnectDragPreview(connector)];
}
function useAccept(spec) {
  var accept = spec.accept;
  return T$4(function() {
    invariant(spec.accept != null, "accept must be defined");
    return Array.isArray(accept) ? accept : [accept];
  }, [accept]);
}
function _classCallCheck$5(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$5(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$5(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$5(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$6(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var DropTargetImpl = /* @__PURE__ */ (function() {
  function DropTargetImpl2(spec, monitor) {
    _classCallCheck$5(this, DropTargetImpl2);
    _defineProperty$6(this, "spec", void 0);
    _defineProperty$6(this, "monitor", void 0);
    this.spec = spec;
    this.monitor = monitor;
  }
  _createClass$5(DropTargetImpl2, [{
    key: "canDrop",
    value: function canDrop() {
      var spec = this.spec;
      var monitor = this.monitor;
      return spec.canDrop ? spec.canDrop(monitor.getItem(), monitor) : true;
    }
  }, {
    key: "hover",
    value: function hover() {
      var spec = this.spec;
      var monitor = this.monitor;
      if (spec.hover) {
        spec.hover(monitor.getItem(), monitor);
      }
    }
  }, {
    key: "drop",
    value: function drop() {
      var spec = this.spec;
      var monitor = this.monitor;
      if (spec.drop) {
        return spec.drop(monitor.getItem(), monitor);
      }
    }
  }]);
  return DropTargetImpl2;
})();
function useDropTarget(spec, monitor) {
  var dropTarget = T$4(function() {
    return new DropTargetImpl(spec, monitor);
  }, [monitor]);
  y$4(function() {
    dropTarget.spec = spec;
  }, [spec]);
  return dropTarget;
}
function _slicedToArray$1(arr, i2) {
  return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i2) || _unsupportedIterableToArray$1(arr, i2) || _nonIterableRest$1();
}
function _nonIterableRest$1() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$1(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray$1(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$1(o2, minLen);
}
function _arrayLikeToArray$1(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit$1(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$1(arr) {
  if (Array.isArray(arr)) return arr;
}
function useRegisteredDropTarget(spec, monitor, connector) {
  var manager = useDragDropManager();
  var dropTarget = useDropTarget(spec, monitor);
  var accept = useAccept(spec);
  useIsomorphicLayoutEffect(function registerDropTarget() {
    var _registerTarget = registerTarget(accept, dropTarget, manager), _registerTarget2 = _slicedToArray$1(_registerTarget, 2), handlerId = _registerTarget2[0], unregister = _registerTarget2[1];
    monitor.receiveHandlerId(handlerId);
    connector.receiveHandlerId(handlerId);
    return unregister;
  }, [manager, monitor, dropTarget, connector, accept.map(function(a2) {
    return a2.toString();
  }).join("|")]);
}
function useDropTargetMonitor() {
  var manager = useDragDropManager();
  return T$4(function() {
    return new DropTargetMonitorImpl(manager);
  }, [manager]);
}
function useDropTargetConnector(options2) {
  var manager = useDragDropManager();
  var connector = T$4(function() {
    return new TargetConnector(manager.getBackend());
  }, [manager]);
  useIsomorphicLayoutEffect(function() {
    connector.dropTargetOptions = options2 || null;
    connector.reconnect();
    return function() {
      return connector.disconnectDropTarget();
    };
  }, [options2]);
  return connector;
}
function useConnectDropTarget(connector) {
  return T$4(function() {
    return connector.hooks.dropTarget();
  }, [connector]);
}
function useDrop(specArg, deps) {
  var spec = useOptionalFactory(specArg, deps);
  var monitor = useDropTargetMonitor();
  var connector = useDropTargetConnector(spec.options);
  useRegisteredDropTarget(spec, monitor, connector);
  return [useCollectedProps(spec.collect, monitor, connector), useConnectDropTarget(connector)];
}
function _slicedToArray(arr, i2) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i2) || _unsupportedIterableToArray(arr, i2) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray(o2, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) {
    arr2[i2] = arr[i2];
  }
  return arr2;
}
function _iterableToArrayLimit(arr, i2) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n2 = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n2 = (_s = _i.next()).done); _n2 = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n2 && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function useDragLayer(collect) {
  var dragDropManager = useDragDropManager();
  var monitor = dragDropManager.getMonitor();
  var _useCollector = useCollector(monitor, collect), _useCollector2 = _slicedToArray(_useCollector, 2), collected = _useCollector2[0], updateCollected = _useCollector2[1];
  y$4(function() {
    return monitor.subscribeToOffsetChange(updateCollected);
  });
  y$4(function() {
    return monitor.subscribeToStateChange(updateCollected);
  });
  return collected;
}
function memoize(fn2) {
  var result = null;
  var memoized = function memoized2() {
    if (result == null) {
      result = fn2();
    }
    return result;
  };
  return memoized;
}
function without(items2, item) {
  return items2.filter(function(i2) {
    return i2 !== item;
  });
}
function union(itemsA, itemsB) {
  var set = /* @__PURE__ */ new Set();
  var insertItem = function insertItem2(item) {
    return set.add(item);
  };
  itemsA.forEach(insertItem);
  itemsB.forEach(insertItem);
  var result = [];
  set.forEach(function(key) {
    return result.push(key);
  });
  return result;
}
function _classCallCheck$4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$4(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$4(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$4(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$5(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var EnterLeaveCounter = /* @__PURE__ */ (function() {
  function EnterLeaveCounter2(isNodeInDocument) {
    _classCallCheck$4(this, EnterLeaveCounter2);
    _defineProperty$5(this, "entered", []);
    _defineProperty$5(this, "isNodeInDocument", void 0);
    this.isNodeInDocument = isNodeInDocument;
  }
  _createClass$4(EnterLeaveCounter2, [{
    key: "enter",
    value: function enter(enteringNode) {
      var _this = this;
      var previousLength = this.entered.length;
      var isNodeEntered = function isNodeEntered2(node) {
        return _this.isNodeInDocument(node) && (!node.contains || node.contains(enteringNode));
      };
      this.entered = union(this.entered.filter(isNodeEntered), [enteringNode]);
      return previousLength === 0 && this.entered.length > 0;
    }
  }, {
    key: "leave",
    value: function leave(leavingNode) {
      var previousLength = this.entered.length;
      this.entered = without(this.entered.filter(this.isNodeInDocument), leavingNode);
      return previousLength > 0 && this.entered.length === 0;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.entered = [];
    }
  }]);
  return EnterLeaveCounter2;
})();
var isFirefox = memoize(function() {
  return /firefox/i.test(navigator.userAgent);
});
var isSafari$1 = memoize(function() {
  return Boolean(window.safari);
});
function _classCallCheck$3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$3(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$3(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$3(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$4(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var MonotonicInterpolant = /* @__PURE__ */ (function() {
  function MonotonicInterpolant2(xs, ys) {
    _classCallCheck$3(this, MonotonicInterpolant2);
    _defineProperty$4(this, "xs", void 0);
    _defineProperty$4(this, "ys", void 0);
    _defineProperty$4(this, "c1s", void 0);
    _defineProperty$4(this, "c2s", void 0);
    _defineProperty$4(this, "c3s", void 0);
    var length = xs.length;
    var indexes = [];
    for (var i2 = 0; i2 < length; i2++) {
      indexes.push(i2);
    }
    indexes.sort(function(a2, b2) {
      return xs[a2] < xs[b2] ? -1 : 1;
    });
    var dxs = [];
    var ms = [];
    var dx;
    var dy;
    for (var _i = 0; _i < length - 1; _i++) {
      dx = xs[_i + 1] - xs[_i];
      dy = ys[_i + 1] - ys[_i];
      dxs.push(dx);
      ms.push(dy / dx);
    }
    var c1s = [ms[0]];
    for (var _i2 = 0; _i2 < dxs.length - 1; _i2++) {
      var m2 = ms[_i2];
      var mNext = ms[_i2 + 1];
      if (m2 * mNext <= 0) {
        c1s.push(0);
      } else {
        dx = dxs[_i2];
        var dxNext = dxs[_i2 + 1];
        var common = dx + dxNext;
        c1s.push(3 * common / ((common + dxNext) / m2 + (common + dx) / mNext));
      }
    }
    c1s.push(ms[ms.length - 1]);
    var c2s = [];
    var c3s = [];
    var m3;
    for (var _i3 = 0; _i3 < c1s.length - 1; _i3++) {
      m3 = ms[_i3];
      var c1 = c1s[_i3];
      var invDx = 1 / dxs[_i3];
      var _common = c1 + c1s[_i3 + 1] - m3 - m3;
      c2s.push((m3 - c1 - _common) * invDx);
      c3s.push(_common * invDx * invDx);
    }
    this.xs = xs;
    this.ys = ys;
    this.c1s = c1s;
    this.c2s = c2s;
    this.c3s = c3s;
  }
  _createClass$3(MonotonicInterpolant2, [{
    key: "interpolate",
    value: function interpolate(x2) {
      var xs = this.xs, ys = this.ys, c1s = this.c1s, c2s = this.c2s, c3s = this.c3s;
      var i2 = xs.length - 1;
      if (x2 === xs[i2]) {
        return ys[i2];
      }
      var low = 0;
      var high = c3s.length - 1;
      var mid;
      while (low <= high) {
        mid = Math.floor(0.5 * (low + high));
        var xHere = xs[mid];
        if (xHere < x2) {
          low = mid + 1;
        } else if (xHere > x2) {
          high = mid - 1;
        } else {
          return ys[mid];
        }
      }
      i2 = Math.max(0, high);
      var diff = x2 - xs[i2];
      var diffSq = diff * diff;
      return ys[i2] + c1s[i2] * diff + c2s[i2] * diffSq + c3s[i2] * diff * diffSq;
    }
  }]);
  return MonotonicInterpolant2;
})();
var ELEMENT_NODE = 1;
function getNodeClientOffset(node) {
  var el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;
  if (!el) {
    return null;
  }
  var _el$getBoundingClient = el.getBoundingClientRect(), top = _el$getBoundingClient.top, left = _el$getBoundingClient.left;
  return {
    x: left,
    y: top
  };
}
function getEventClientOffset(e2) {
  return {
    x: e2.clientX,
    y: e2.clientY
  };
}
function isImageNode(node) {
  var _document$documentEle;
  return node.nodeName === "IMG" && (isFirefox() || !((_document$documentEle = document.documentElement) !== null && _document$documentEle !== void 0 && _document$documentEle.contains(node)));
}
function getDragPreviewSize(isImage2, dragPreview, sourceWidth, sourceHeight) {
  var dragPreviewWidth = isImage2 ? dragPreview.width : sourceWidth;
  var dragPreviewHeight = isImage2 ? dragPreview.height : sourceHeight;
  if (isSafari$1() && isImage2) {
    dragPreviewHeight /= window.devicePixelRatio;
    dragPreviewWidth /= window.devicePixelRatio;
  }
  return {
    dragPreviewWidth,
    dragPreviewHeight
  };
}
function getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint, offsetPoint) {
  var isImage2 = isImageNode(dragPreview);
  var dragPreviewNode = isImage2 ? sourceNode : dragPreview;
  var dragPreviewNodeOffsetFromClient = getNodeClientOffset(dragPreviewNode);
  var offsetFromDragPreview = {
    x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
    y: clientOffset.y - dragPreviewNodeOffsetFromClient.y
  };
  var sourceWidth = sourceNode.offsetWidth, sourceHeight = sourceNode.offsetHeight;
  var anchorX = anchorPoint.anchorX, anchorY = anchorPoint.anchorY;
  var _getDragPreviewSize = getDragPreviewSize(isImage2, dragPreview, sourceWidth, sourceHeight), dragPreviewWidth = _getDragPreviewSize.dragPreviewWidth, dragPreviewHeight = _getDragPreviewSize.dragPreviewHeight;
  var calculateYOffset = function calculateYOffset2() {
    var interpolantY = new MonotonicInterpolant([0, 0.5, 1], [
      // Dock to the top
      offsetFromDragPreview.y,
      // Align at the center
      offsetFromDragPreview.y / sourceHeight * dragPreviewHeight,
      // Dock to the bottom
      offsetFromDragPreview.y + dragPreviewHeight - sourceHeight
    ]);
    var y2 = interpolantY.interpolate(anchorY);
    if (isSafari$1() && isImage2) {
      y2 += (window.devicePixelRatio - 1) * dragPreviewHeight;
    }
    return y2;
  };
  var calculateXOffset = function calculateXOffset2() {
    var interpolantX = new MonotonicInterpolant([0, 0.5, 1], [
      // Dock to the left
      offsetFromDragPreview.x,
      // Align at the center
      offsetFromDragPreview.x / sourceWidth * dragPreviewWidth,
      // Dock to the right
      offsetFromDragPreview.x + dragPreviewWidth - sourceWidth
    ]);
    return interpolantX.interpolate(anchorX);
  };
  var offsetX = offsetPoint.offsetX, offsetY = offsetPoint.offsetY;
  var isManualOffsetX = offsetX === 0 || offsetX;
  var isManualOffsetY = offsetY === 0 || offsetY;
  return {
    x: isManualOffsetX ? offsetX : calculateXOffset(),
    y: isManualOffsetY ? offsetY : calculateYOffset()
  };
}
var FILE = "__NATIVE_FILE__";
var URL$1 = "__NATIVE_URL__";
var TEXT = "__NATIVE_TEXT__";
var HTML = "__NATIVE_HTML__";
const NativeTypes = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FILE,
  HTML,
  TEXT,
  URL: URL$1
}, Symbol.toStringTag, { value: "Module" }));
function getDataFromDataTransfer(dataTransfer5, typesToTry, defaultValue) {
  var result = typesToTry.reduce(function(resultSoFar, typeToTry) {
    return resultSoFar || dataTransfer5.getData(typeToTry);
  }, "");
  return result != null ? result : defaultValue;
}
var _nativeTypesConfig;
function _defineProperty$3(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var nativeTypesConfig = (_nativeTypesConfig = {}, _defineProperty$3(_nativeTypesConfig, FILE, {
  exposeProperties: {
    files: function files(dataTransfer5) {
      return Array.prototype.slice.call(dataTransfer5.files);
    },
    items: function items(dataTransfer5) {
      return dataTransfer5.items;
    },
    dataTransfer: function dataTransfer(_dataTransfer) {
      return _dataTransfer;
    }
  },
  matchesTypes: ["Files"]
}), _defineProperty$3(_nativeTypesConfig, HTML, {
  exposeProperties: {
    html: function html(dataTransfer5, matchesTypes) {
      return getDataFromDataTransfer(dataTransfer5, matchesTypes, "");
    },
    dataTransfer: function dataTransfer2(_dataTransfer2) {
      return _dataTransfer2;
    }
  },
  matchesTypes: ["Html", "text/html"]
}), _defineProperty$3(_nativeTypesConfig, URL$1, {
  exposeProperties: {
    urls: function urls(dataTransfer5, matchesTypes) {
      return getDataFromDataTransfer(dataTransfer5, matchesTypes, "").split("\n");
    },
    dataTransfer: function dataTransfer3(_dataTransfer3) {
      return _dataTransfer3;
    }
  },
  matchesTypes: ["Url", "text/uri-list"]
}), _defineProperty$3(_nativeTypesConfig, TEXT, {
  exposeProperties: {
    text: function text(dataTransfer5, matchesTypes) {
      return getDataFromDataTransfer(dataTransfer5, matchesTypes, "");
    },
    dataTransfer: function dataTransfer4(_dataTransfer4) {
      return _dataTransfer4;
    }
  },
  matchesTypes: ["Text", "text/plain"]
}), _nativeTypesConfig);
function _classCallCheck$2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$2(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$2(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var NativeDragSource = /* @__PURE__ */ (function() {
  function NativeDragSource2(config2) {
    _classCallCheck$2(this, NativeDragSource2);
    _defineProperty$2(this, "item", void 0);
    _defineProperty$2(this, "config", void 0);
    this.config = config2;
    this.item = {};
    this.initializeExposedProperties();
  }
  _createClass$2(NativeDragSource2, [{
    key: "initializeExposedProperties",
    value: function initializeExposedProperties() {
      var _this = this;
      Object.keys(this.config.exposeProperties).forEach(function(property) {
        Object.defineProperty(_this.item, property, {
          configurable: true,
          enumerable: true,
          get: function get2() {
            console.warn(`Browser doesn't allow reading "`.concat(property, '" until the drop event.'));
            return null;
          }
        });
      });
    }
  }, {
    key: "loadDataTransfer",
    value: function loadDataTransfer(dataTransfer5) {
      var _this2 = this;
      if (dataTransfer5) {
        var newProperties = {};
        Object.keys(this.config.exposeProperties).forEach(function(property) {
          newProperties[property] = {
            value: _this2.config.exposeProperties[property](dataTransfer5, _this2.config.matchesTypes),
            configurable: true,
            enumerable: true
          };
        });
        Object.defineProperties(this.item, newProperties);
      }
    }
  }, {
    key: "canDrag",
    value: function canDrag() {
      return true;
    }
  }, {
    key: "beginDrag",
    value: function beginDrag() {
      return this.item;
    }
  }, {
    key: "isDragging",
    value: function isDragging(monitor, handle) {
      return handle === monitor.getSourceId();
    }
  }, {
    key: "endDrag",
    value: function endDrag() {
    }
  }]);
  return NativeDragSource2;
})();
function createNativeDragSource(type, dataTransfer5) {
  var result = new NativeDragSource(nativeTypesConfig[type]);
  result.loadDataTransfer(dataTransfer5);
  return result;
}
function matchNativeItemType(dataTransfer5) {
  if (!dataTransfer5) {
    return null;
  }
  var dataTransferTypes = Array.prototype.slice.call(dataTransfer5.types || []);
  return Object.keys(nativeTypesConfig).filter(function(nativeItemType) {
    var matchesTypes = nativeTypesConfig[nativeItemType].matchesTypes;
    return matchesTypes.some(function(t2) {
      return dataTransferTypes.indexOf(t2) > -1;
    });
  })[0] || null;
}
function _classCallCheck$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$1(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var OptionsReader = /* @__PURE__ */ (function() {
  function OptionsReader2(globalContext, options2) {
    _classCallCheck$1(this, OptionsReader2);
    _defineProperty$1(this, "ownerDocument", null);
    _defineProperty$1(this, "globalContext", void 0);
    _defineProperty$1(this, "optionsArgs", void 0);
    this.globalContext = globalContext;
    this.optionsArgs = options2;
  }
  _createClass$1(OptionsReader2, [{
    key: "window",
    get: function get2() {
      if (this.globalContext) {
        return this.globalContext;
      } else if (typeof window !== "undefined") {
        return window;
      }
      return void 0;
    }
  }, {
    key: "document",
    get: function get2() {
      var _this$globalContext;
      if ((_this$globalContext = this.globalContext) !== null && _this$globalContext !== void 0 && _this$globalContext.document) {
        return this.globalContext.document;
      } else if (this.window) {
        return this.window.document;
      } else {
        return void 0;
      }
    }
  }, {
    key: "rootElement",
    get: function get2() {
      var _this$optionsArgs;
      return ((_this$optionsArgs = this.optionsArgs) === null || _this$optionsArgs === void 0 ? void 0 : _this$optionsArgs.rootElement) || this.window;
    }
  }]);
  return OptionsReader2;
})();
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  return Constructor;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var HTML5BackendImpl = /* @__PURE__ */ (function() {
  function HTML5BackendImpl2(manager, globalContext, options2) {
    var _this = this;
    _classCallCheck(this, HTML5BackendImpl2);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "actions", void 0);
    _defineProperty(this, "monitor", void 0);
    _defineProperty(this, "registry", void 0);
    _defineProperty(this, "enterLeaveCounter", void 0);
    _defineProperty(this, "sourcePreviewNodes", /* @__PURE__ */ new Map());
    _defineProperty(this, "sourcePreviewNodeOptions", /* @__PURE__ */ new Map());
    _defineProperty(this, "sourceNodes", /* @__PURE__ */ new Map());
    _defineProperty(this, "sourceNodeOptions", /* @__PURE__ */ new Map());
    _defineProperty(this, "dragStartSourceIds", null);
    _defineProperty(this, "dropTargetIds", []);
    _defineProperty(this, "dragEnterTargetIds", []);
    _defineProperty(this, "currentNativeSource", null);
    _defineProperty(this, "currentNativeHandle", null);
    _defineProperty(this, "currentDragSourceNode", null);
    _defineProperty(this, "altKeyPressed", false);
    _defineProperty(this, "mouseMoveTimeoutTimer", null);
    _defineProperty(this, "asyncEndDragFrameId", null);
    _defineProperty(this, "dragOverTargetIds", null);
    _defineProperty(this, "lastClientOffset", null);
    _defineProperty(this, "hoverRafId", null);
    _defineProperty(this, "getSourceClientOffset", function(sourceId) {
      var source = _this.sourceNodes.get(sourceId);
      return source && getNodeClientOffset(source) || null;
    });
    _defineProperty(this, "endDragNativeItem", function() {
      if (!_this.isDraggingNativeItem()) {
        return;
      }
      _this.actions.endDrag();
      if (_this.currentNativeHandle) {
        _this.registry.removeSource(_this.currentNativeHandle);
      }
      _this.currentNativeHandle = null;
      _this.currentNativeSource = null;
    });
    _defineProperty(this, "isNodeInDocument", function(node) {
      return Boolean(node && _this.document && _this.document.body && _this.document.body.contains(node));
    });
    _defineProperty(this, "endDragIfSourceWasRemovedFromDOM", function() {
      var node = _this.currentDragSourceNode;
      if (node == null || _this.isNodeInDocument(node)) {
        return;
      }
      if (_this.clearCurrentDragSourceNode() && _this.monitor.isDragging()) {
        _this.actions.endDrag();
      }
    });
    _defineProperty(this, "handleTopDragStartCapture", function() {
      _this.clearCurrentDragSourceNode();
      _this.dragStartSourceIds = [];
    });
    _defineProperty(this, "handleTopDragStart", function(e2) {
      if (e2.defaultPrevented) {
        return;
      }
      var dragStartSourceIds = _this.dragStartSourceIds;
      _this.dragStartSourceIds = null;
      var clientOffset = getEventClientOffset(e2);
      if (_this.monitor.isDragging()) {
        _this.actions.endDrag();
      }
      _this.actions.beginDrag(dragStartSourceIds || [], {
        publishSource: false,
        getSourceClientOffset: _this.getSourceClientOffset,
        clientOffset
      });
      var dataTransfer5 = e2.dataTransfer;
      var nativeType = matchNativeItemType(dataTransfer5);
      if (_this.monitor.isDragging()) {
        if (dataTransfer5 && typeof dataTransfer5.setDragImage === "function") {
          var sourceId = _this.monitor.getSourceId();
          var sourceNode = _this.sourceNodes.get(sourceId);
          var dragPreview = _this.sourcePreviewNodes.get(sourceId) || sourceNode;
          if (dragPreview) {
            var _this$getCurrentSourc = _this.getCurrentSourcePreviewNodeOptions(), anchorX = _this$getCurrentSourc.anchorX, anchorY = _this$getCurrentSourc.anchorY, offsetX = _this$getCurrentSourc.offsetX, offsetY = _this$getCurrentSourc.offsetY;
            var anchorPoint = {
              anchorX,
              anchorY
            };
            var offsetPoint = {
              offsetX,
              offsetY
            };
            var dragPreviewOffset = getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint, offsetPoint);
            dataTransfer5.setDragImage(dragPreview, dragPreviewOffset.x, dragPreviewOffset.y);
          }
        }
        try {
          dataTransfer5 === null || dataTransfer5 === void 0 ? void 0 : dataTransfer5.setData("application/json", {});
        } catch (err) {
        }
        _this.setCurrentDragSourceNode(e2.target);
        var _this$getCurrentSourc2 = _this.getCurrentSourcePreviewNodeOptions(), captureDraggingState = _this$getCurrentSourc2.captureDraggingState;
        if (!captureDraggingState) {
          setTimeout(function() {
            return _this.actions.publishDragSource();
          }, 0);
        } else {
          _this.actions.publishDragSource();
        }
      } else if (nativeType) {
        _this.beginDragNativeItem(nativeType);
      } else if (dataTransfer5 && !dataTransfer5.types && (e2.target && !e2.target.hasAttribute || !e2.target.hasAttribute("draggable"))) {
        return;
      } else {
        e2.preventDefault();
      }
    });
    _defineProperty(this, "handleTopDragEndCapture", function() {
      if (_this.clearCurrentDragSourceNode() && _this.monitor.isDragging()) {
        _this.actions.endDrag();
      }
    });
    _defineProperty(this, "handleTopDragEnterCapture", function(e2) {
      _this.dragEnterTargetIds = [];
      var isFirstEnter = _this.enterLeaveCounter.enter(e2.target);
      if (!isFirstEnter || _this.monitor.isDragging()) {
        return;
      }
      var dataTransfer5 = e2.dataTransfer;
      var nativeType = matchNativeItemType(dataTransfer5);
      if (nativeType) {
        _this.beginDragNativeItem(nativeType, dataTransfer5);
      }
    });
    _defineProperty(this, "handleTopDragEnter", function(e2) {
      var dragEnterTargetIds = _this.dragEnterTargetIds;
      _this.dragEnterTargetIds = [];
      if (!_this.monitor.isDragging()) {
        return;
      }
      _this.altKeyPressed = e2.altKey;
      if (dragEnterTargetIds.length > 0) {
        _this.actions.hover(dragEnterTargetIds, {
          clientOffset: getEventClientOffset(e2)
        });
      }
      var canDrop = dragEnterTargetIds.some(function(targetId) {
        return _this.monitor.canDropOnTarget(targetId);
      });
      if (canDrop) {
        e2.preventDefault();
        if (e2.dataTransfer) {
          e2.dataTransfer.dropEffect = _this.getCurrentDropEffect();
        }
      }
    });
    _defineProperty(this, "handleTopDragOverCapture", function() {
      _this.dragOverTargetIds = [];
    });
    _defineProperty(this, "handleTopDragOver", function(e2) {
      var dragOverTargetIds = _this.dragOverTargetIds;
      _this.dragOverTargetIds = [];
      if (!_this.monitor.isDragging()) {
        e2.preventDefault();
        if (e2.dataTransfer) {
          e2.dataTransfer.dropEffect = "none";
        }
        return;
      }
      _this.altKeyPressed = e2.altKey;
      _this.lastClientOffset = getEventClientOffset(e2);
      if (_this.hoverRafId === null && typeof requestAnimationFrame !== "undefined") {
        _this.hoverRafId = requestAnimationFrame(function() {
          if (_this.monitor.isDragging()) {
            _this.actions.hover(dragOverTargetIds || [], {
              clientOffset: _this.lastClientOffset
            });
          }
          _this.hoverRafId = null;
        });
      }
      var canDrop = (dragOverTargetIds || []).some(function(targetId) {
        return _this.monitor.canDropOnTarget(targetId);
      });
      if (canDrop) {
        e2.preventDefault();
        if (e2.dataTransfer) {
          e2.dataTransfer.dropEffect = _this.getCurrentDropEffect();
        }
      } else if (_this.isDraggingNativeItem()) {
        e2.preventDefault();
      } else {
        e2.preventDefault();
        if (e2.dataTransfer) {
          e2.dataTransfer.dropEffect = "none";
        }
      }
    });
    _defineProperty(this, "handleTopDragLeaveCapture", function(e2) {
      if (_this.isDraggingNativeItem()) {
        e2.preventDefault();
      }
      var isLastLeave = _this.enterLeaveCounter.leave(e2.target);
      if (!isLastLeave) {
        return;
      }
      if (_this.isDraggingNativeItem()) {
        setTimeout(function() {
          return _this.endDragNativeItem();
        }, 0);
      }
    });
    _defineProperty(this, "handleTopDropCapture", function(e2) {
      _this.dropTargetIds = [];
      if (_this.isDraggingNativeItem()) {
        var _this$currentNativeSo;
        e2.preventDefault();
        (_this$currentNativeSo = _this.currentNativeSource) === null || _this$currentNativeSo === void 0 ? void 0 : _this$currentNativeSo.loadDataTransfer(e2.dataTransfer);
      } else if (matchNativeItemType(e2.dataTransfer)) {
        e2.preventDefault();
      }
      _this.enterLeaveCounter.reset();
    });
    _defineProperty(this, "handleTopDrop", function(e2) {
      var dropTargetIds = _this.dropTargetIds;
      _this.dropTargetIds = [];
      _this.actions.hover(dropTargetIds, {
        clientOffset: getEventClientOffset(e2)
      });
      _this.actions.drop({
        dropEffect: _this.getCurrentDropEffect()
      });
      if (_this.isDraggingNativeItem()) {
        _this.endDragNativeItem();
      } else if (_this.monitor.isDragging()) {
        _this.actions.endDrag();
      }
    });
    _defineProperty(this, "handleSelectStart", function(e2) {
      var target = e2.target;
      if (typeof target.dragDrop !== "function") {
        return;
      }
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      e2.preventDefault();
      target.dragDrop();
    });
    this.options = new OptionsReader(globalContext, options2);
    this.actions = manager.getActions();
    this.monitor = manager.getMonitor();
    this.registry = manager.getRegistry();
    this.enterLeaveCounter = new EnterLeaveCounter(this.isNodeInDocument);
  }
  _createClass(HTML5BackendImpl2, [{
    key: "profile",
    value: function profile() {
      var _this$dragStartSource, _this$dragOverTargetI;
      return {
        sourcePreviewNodes: this.sourcePreviewNodes.size,
        sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
        sourceNodeOptions: this.sourceNodeOptions.size,
        sourceNodes: this.sourceNodes.size,
        dragStartSourceIds: ((_this$dragStartSource = this.dragStartSourceIds) === null || _this$dragStartSource === void 0 ? void 0 : _this$dragStartSource.length) || 0,
        dropTargetIds: this.dropTargetIds.length,
        dragEnterTargetIds: this.dragEnterTargetIds.length,
        dragOverTargetIds: ((_this$dragOverTargetI = this.dragOverTargetIds) === null || _this$dragOverTargetI === void 0 ? void 0 : _this$dragOverTargetI.length) || 0
      };
    }
    // public for test
  }, {
    key: "window",
    get: function get2() {
      return this.options.window;
    }
  }, {
    key: "document",
    get: function get2() {
      return this.options.document;
    }
    /**
     * Get the root element to use for event subscriptions
     */
  }, {
    key: "rootElement",
    get: function get2() {
      return this.options.rootElement;
    }
  }, {
    key: "setup",
    value: function setup() {
      var root2 = this.rootElement;
      if (root2 === void 0) {
        return;
      }
      if (root2.__isReactDndBackendSetUp) {
        throw new Error("Cannot have two HTML5 backends at the same time.");
      }
      root2.__isReactDndBackendSetUp = true;
      this.addEventListeners(root2);
    }
  }, {
    key: "teardown",
    value: function teardown() {
      var root2 = this.rootElement;
      if (root2 === void 0) {
        return;
      }
      root2.__isReactDndBackendSetUp = false;
      this.removeEventListeners(this.rootElement);
      this.clearCurrentDragSourceNode();
      if (this.asyncEndDragFrameId) {
        var _this$window;
        (_this$window = this.window) === null || _this$window === void 0 ? void 0 : _this$window.cancelAnimationFrame(this.asyncEndDragFrameId);
      }
    }
  }, {
    key: "connectDragPreview",
    value: function connectDragPreview(sourceId, node, options2) {
      var _this2 = this;
      this.sourcePreviewNodeOptions.set(sourceId, options2);
      this.sourcePreviewNodes.set(sourceId, node);
      return function() {
        _this2.sourcePreviewNodes.delete(sourceId);
        _this2.sourcePreviewNodeOptions.delete(sourceId);
      };
    }
  }, {
    key: "connectDragSource",
    value: function connectDragSource(sourceId, node, options2) {
      var _this3 = this;
      this.sourceNodes.set(sourceId, node);
      this.sourceNodeOptions.set(sourceId, options2);
      var handleDragStart = function handleDragStart2(e2) {
        return _this3.handleDragStart(e2, sourceId);
      };
      var handleSelectStart = function handleSelectStart2(e2) {
        return _this3.handleSelectStart(e2);
      };
      node.setAttribute("draggable", "true");
      node.addEventListener("dragstart", handleDragStart);
      node.addEventListener("selectstart", handleSelectStart);
      return function() {
        _this3.sourceNodes.delete(sourceId);
        _this3.sourceNodeOptions.delete(sourceId);
        node.removeEventListener("dragstart", handleDragStart);
        node.removeEventListener("selectstart", handleSelectStart);
        node.setAttribute("draggable", "false");
      };
    }
  }, {
    key: "connectDropTarget",
    value: function connectDropTarget(targetId, node) {
      var _this4 = this;
      var handleDragEnter = function handleDragEnter2(e2) {
        return _this4.handleDragEnter(e2, targetId);
      };
      var handleDragOver = function handleDragOver2(e2) {
        return _this4.handleDragOver(e2, targetId);
      };
      var handleDrop = function handleDrop2(e2) {
        return _this4.handleDrop(e2, targetId);
      };
      node.addEventListener("dragenter", handleDragEnter);
      node.addEventListener("dragover", handleDragOver);
      node.addEventListener("drop", handleDrop);
      return function() {
        node.removeEventListener("dragenter", handleDragEnter);
        node.removeEventListener("dragover", handleDragOver);
        node.removeEventListener("drop", handleDrop);
      };
    }
  }, {
    key: "addEventListeners",
    value: function addEventListeners(target) {
      if (!target.addEventListener) {
        return;
      }
      target.addEventListener("dragstart", this.handleTopDragStart);
      target.addEventListener("dragstart", this.handleTopDragStartCapture, true);
      target.addEventListener("dragend", this.handleTopDragEndCapture, true);
      target.addEventListener("dragenter", this.handleTopDragEnter);
      target.addEventListener("dragenter", this.handleTopDragEnterCapture, true);
      target.addEventListener("dragleave", this.handleTopDragLeaveCapture, true);
      target.addEventListener("dragover", this.handleTopDragOver);
      target.addEventListener("dragover", this.handleTopDragOverCapture, true);
      target.addEventListener("drop", this.handleTopDrop);
      target.addEventListener("drop", this.handleTopDropCapture, true);
    }
  }, {
    key: "removeEventListeners",
    value: function removeEventListeners(target) {
      if (!target.removeEventListener) {
        return;
      }
      target.removeEventListener("dragstart", this.handleTopDragStart);
      target.removeEventListener("dragstart", this.handleTopDragStartCapture, true);
      target.removeEventListener("dragend", this.handleTopDragEndCapture, true);
      target.removeEventListener("dragenter", this.handleTopDragEnter);
      target.removeEventListener("dragenter", this.handleTopDragEnterCapture, true);
      target.removeEventListener("dragleave", this.handleTopDragLeaveCapture, true);
      target.removeEventListener("dragover", this.handleTopDragOver);
      target.removeEventListener("dragover", this.handleTopDragOverCapture, true);
      target.removeEventListener("drop", this.handleTopDrop);
      target.removeEventListener("drop", this.handleTopDropCapture, true);
    }
  }, {
    key: "getCurrentSourceNodeOptions",
    value: function getCurrentSourceNodeOptions() {
      var sourceId = this.monitor.getSourceId();
      var sourceNodeOptions = this.sourceNodeOptions.get(sourceId);
      return _objectSpread({
        dropEffect: this.altKeyPressed ? "copy" : "move"
      }, sourceNodeOptions || {});
    }
  }, {
    key: "getCurrentDropEffect",
    value: function getCurrentDropEffect() {
      if (this.isDraggingNativeItem()) {
        return "copy";
      }
      return this.getCurrentSourceNodeOptions().dropEffect;
    }
  }, {
    key: "getCurrentSourcePreviewNodeOptions",
    value: function getCurrentSourcePreviewNodeOptions() {
      var sourceId = this.monitor.getSourceId();
      var sourcePreviewNodeOptions = this.sourcePreviewNodeOptions.get(sourceId);
      return _objectSpread({
        anchorX: 0.5,
        anchorY: 0.5,
        captureDraggingState: false
      }, sourcePreviewNodeOptions || {});
    }
  }, {
    key: "isDraggingNativeItem",
    value: function isDraggingNativeItem() {
      var itemType = this.monitor.getItemType();
      return Object.keys(NativeTypes).some(function(key) {
        return NativeTypes[key] === itemType;
      });
    }
  }, {
    key: "beginDragNativeItem",
    value: function beginDragNativeItem(type, dataTransfer5) {
      this.clearCurrentDragSourceNode();
      this.currentNativeSource = createNativeDragSource(type, dataTransfer5);
      this.currentNativeHandle = this.registry.addSource(type, this.currentNativeSource);
      this.actions.beginDrag([this.currentNativeHandle]);
    }
  }, {
    key: "setCurrentDragSourceNode",
    value: function setCurrentDragSourceNode(node) {
      var _this5 = this;
      this.clearCurrentDragSourceNode();
      this.currentDragSourceNode = node;
      var MOUSE_MOVE_TIMEOUT = 1e3;
      this.mouseMoveTimeoutTimer = setTimeout(function() {
        var _this5$rootElement;
        return (_this5$rootElement = _this5.rootElement) === null || _this5$rootElement === void 0 ? void 0 : _this5$rootElement.addEventListener("mousemove", _this5.endDragIfSourceWasRemovedFromDOM, true);
      }, MOUSE_MOVE_TIMEOUT);
    }
  }, {
    key: "clearCurrentDragSourceNode",
    value: function clearCurrentDragSourceNode() {
      if (this.currentDragSourceNode) {
        this.currentDragSourceNode = null;
        if (this.rootElement) {
          var _this$window2;
          (_this$window2 = this.window) === null || _this$window2 === void 0 ? void 0 : _this$window2.clearTimeout(this.mouseMoveTimeoutTimer || void 0);
          this.rootElement.removeEventListener("mousemove", this.endDragIfSourceWasRemovedFromDOM, true);
        }
        this.mouseMoveTimeoutTimer = null;
        return true;
      }
      return false;
    }
  }, {
    key: "handleDragStart",
    value: function handleDragStart(e2, sourceId) {
      if (e2.defaultPrevented) {
        return;
      }
      if (!this.dragStartSourceIds) {
        this.dragStartSourceIds = [];
      }
      this.dragStartSourceIds.unshift(sourceId);
    }
  }, {
    key: "handleDragEnter",
    value: function handleDragEnter(e2, targetId) {
      this.dragEnterTargetIds.unshift(targetId);
    }
  }, {
    key: "handleDragOver",
    value: function handleDragOver(e2, targetId) {
      if (this.dragOverTargetIds === null) {
        this.dragOverTargetIds = [];
      }
      this.dragOverTargetIds.unshift(targetId);
    }
  }, {
    key: "handleDrop",
    value: function handleDrop(e2, targetId) {
      this.dropTargetIds.unshift(targetId);
    }
  }]);
  return HTML5BackendImpl2;
})();
var emptyImage;
function getEmptyImage() {
  if (!emptyImage) {
    emptyImage = new Image();
    emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  }
  return emptyImage;
}
var HTML5Backend = function createBackend(manager, context, options2) {
  return new HTML5BackendImpl(manager, context, options2);
};
function useDragHook(node) {
  const tree = useTreeApi();
  const ids = tree.selectedIds;
  const [_2, ref, preview] = useDrag(() => ({
    canDrag: () => node.isDraggable,
    type: "NODE",
    item: () => {
      const dragIds = tree.isSelected(node.id) ? Array.from(ids) : [node.id];
      tree.dispatch(actions.dragStart(node.id, dragIds));
      return {
        id: node.id,
        dragIds
      };
    },
    end: () => {
      tree.hideCursor();
      tree.dispatch(actions.dragEnd());
    }
  }), [ids, node]);
  y$4(() => {
    preview(getEmptyImage());
  }, [preview]);
  return ref;
}
function measureHover(el, offset) {
  const rect = el.getBoundingClientRect();
  const x2 = offset.x - Math.round(rect.x);
  const y2 = offset.y - Math.round(rect.y);
  const height = rect.height;
  const inTopHalf = y2 < height / 2;
  const inBottomHalf = !inTopHalf;
  const pad = height / 4;
  const inMiddle = y2 > pad && y2 < height - pad;
  const atTop = !inMiddle && inTopHalf;
  const atBottom = !inMiddle && inBottomHalf;
  return {
    x: x2,
    inTopHalf,
    inBottomHalf,
    inMiddle,
    atTop,
    atBottom
  };
}
function getNodesAroundCursor(node, prev, next, hover) {
  if (!node) {
    return [prev, null];
  }
  if (node.isInternal) {
    if (hover.atTop) {
      return [prev, node];
    } else if (hover.inMiddle) {
      return [node, node];
    } else {
      return [node, next];
    }
  } else {
    if (hover.inTopHalf) {
      return [prev, node];
    } else {
      return [node, next];
    }
  }
}
function dropAt(parentId, index) {
  return {
    parentId: parentId || null,
    index
  };
}
function lineCursor(index, level) {
  return {
    type: "line",
    index,
    level
  };
}
function highlightCursor(id) {
  return {
    type: "highlight",
    id
  };
}
function walkUpFrom(node, level) {
  var _a;
  let drop = node;
  while (drop.parent && drop.level > level) {
    drop = drop.parent;
  }
  const parentId = ((_a = drop.parent) === null || _a === void 0 ? void 0 : _a.id) || null;
  const index = indexOf(drop) + 1;
  return {
    parentId,
    index
  };
}
function computeDrop(args) {
  var _a;
  const hover = measureHover(args.element, args.offset);
  const indent = args.indent;
  const hoverLevel = Math.round(Math.max(0, hover.x - indent) / indent);
  const {
    node,
    nextNode,
    prevNode
  } = args;
  const [above, below] = getNodesAroundCursor(node, prevNode, nextNode, hover);
  if (node && node.isInternal && hover.inMiddle) {
    return {
      drop: dropAt(node.id, null),
      cursor: highlightCursor(node.id)
    };
  }
  if (!above) {
    return {
      drop: dropAt((_a = below === null || below === void 0 ? void 0 : below.parent) === null || _a === void 0 ? void 0 : _a.id, 0),
      cursor: lineCursor(0, 0)
    };
  }
  if (isItem(above)) {
    const level = bound(hoverLevel, (below === null || below === void 0 ? void 0 : below.level) || 0, above.level);
    return {
      drop: walkUpFrom(above, level),
      cursor: lineCursor(above.rowIndex + 1, level)
    };
  }
  if (isClosed(above)) {
    const level = bound(hoverLevel, (below === null || below === void 0 ? void 0 : below.level) || 0, above.level);
    return {
      drop: walkUpFrom(above, level),
      cursor: lineCursor(above.rowIndex + 1, level)
    };
  }
  if (isOpenWithEmptyChildren(above)) {
    const level = bound(hoverLevel, 0, above.level + 1);
    if (level > above.level) {
      return {
        drop: dropAt(above.id, 0),
        cursor: lineCursor(above.rowIndex + 1, level)
      };
    } else {
      return {
        drop: walkUpFrom(above, level),
        cursor: lineCursor(above.rowIndex + 1, level)
      };
    }
  }
  return {
    drop: dropAt(above === null || above === void 0 ? void 0 : above.id, 0),
    cursor: lineCursor(above.rowIndex + 1, above.level + 1)
  };
}
function useDropHook(el, node) {
  const tree = useTreeApi();
  const [_2, dropRef] = useDrop(() => ({
    accept: "NODE",
    canDrop: () => tree.canDrop(),
    hover: (_item, m2) => {
      const offset = m2.getClientOffset();
      if (!el.current || !offset) return;
      const {
        cursor,
        drop
      } = computeDrop({
        element: el.current,
        offset,
        indent: tree.indent,
        node,
        prevNode: node.prev,
        nextNode: node.next
      });
      if (drop) tree.dispatch(actions.hovering(drop.parentId, drop.index));
      if (m2.canDrop()) {
        if (cursor) tree.showCursor(cursor);
      } else {
        tree.hideCursor();
      }
    },
    drop: (_3, m2) => {
      if (!m2.canDrop()) return null;
      let {
        parentId,
        index,
        dragIds
      } = tree.state.dnd;
      safeRun$1(tree.props.onMove, {
        dragIds,
        parentId: parentId === ROOT_ID ? null : parentId,
        index: index === null ? 0 : index,
        // When it's null it was dropped over a folder
        dragNodes: tree.dragNodes,
        parentNode: tree.get(parentId)
      });
      tree.open(parentId);
    }
  }), [node, el.current, tree.props]);
  return dropRef;
}
function useFreshNode(index) {
  const tree = useTreeApi();
  const original = tree.at(index);
  if (!original) throw new Error(`Could not find node for index: ${index}`);
  return T$4(() => {
    const fresh = original.clone();
    tree.visibleNodes[index] = fresh;
    return fresh;
  }, [...Object.values(original.state), original]);
}
const RowContainer = gn$1.memo(function RowContainer2({
  index,
  style
}) {
  useDataUpdates();
  useNodesContext();
  const tree = useTreeApi();
  const node = useFreshNode(index);
  const el = A$6(null);
  const dragRef = useDragHook(node);
  const dropRef = useDropHook(el, node);
  const innerRef = q$6((n2) => {
    el.current = n2;
    dropRef(n2);
  }, [dropRef]);
  const indent = tree.indent * node.level;
  const nodeStyle = T$4(() => ({
    paddingLeft: indent
  }), [indent]);
  const rowStyle = T$4(() => {
    var _a, _b;
    return Object.assign(Object.assign({}, style), {
      top: parseFloat(style.top) + ((_b = (_a = tree.props.padding) !== null && _a !== void 0 ? _a : tree.props.paddingTop) !== null && _b !== void 0 ? _b : 0)
    });
  }, [style, tree.props.padding, tree.props.paddingTop]);
  const rowAttrs = {
    role: "treeitem",
    "aria-level": node.level + 1,
    "aria-selected": node.isSelected,
    "aria-expanded": node.isOpen,
    style: rowStyle,
    tabIndex: -1,
    className: tree.props.rowClassName
  };
  y$4(() => {
    var _a;
    if (!node.isEditing && node.isFocused) {
      (_a = el.current) === null || _a === void 0 ? void 0 : _a.focus({
        preventScroll: true
      });
    }
  }, [node.isEditing, node.isFocused, el.current]);
  const Node2 = tree.renderNode;
  const Row = tree.renderRow;
  return u$5(Row, {
    node,
    innerRef,
    attrs: rowAttrs,
    children: u$5(Node2, {
      node,
      tree,
      style: nodeStyle,
      dragHandle: dragRef
    })
  });
});
let focusSearchTerm = "";
let timeoutId = null;
function DefaultContainer() {
  useDataUpdates();
  const tree = useTreeApi();
  return u$5("div", {
    role: "tree",
    style: {
      height: tree.height,
      width: tree.width,
      minHeight: 0,
      minWidth: 0
    },
    onContextMenu: tree.props.onContextMenu,
    onClick: tree.props.onClick,
    tabIndex: 0,
    onFocus: (e2) => {
      if (!e2.currentTarget.contains(e2.relatedTarget)) {
        tree.onFocus();
      }
    },
    onBlur: (e2) => {
      if (!e2.currentTarget.contains(e2.relatedTarget)) {
        tree.onBlur();
      }
    },
    onKeyDown: (e2) => {
      var _a;
      if (tree.isEditing) {
        return;
      }
      if (e2.key === "Backspace") {
        if (!tree.props.onDelete) return;
        const ids = Array.from(tree.selectedIds);
        if (ids.length > 1) {
          let nextFocus = tree.mostRecentNode;
          while (nextFocus && nextFocus.isSelected) {
            nextFocus = nextFocus.nextSibling;
          }
          if (!nextFocus) nextFocus = tree.lastNode;
          tree.focus(nextFocus, {
            scroll: false
          });
          tree.delete(Array.from(ids));
        } else {
          const node2 = tree.focusedNode;
          if (node2) {
            const sib = node2.nextSibling;
            const parent = node2.parent;
            tree.focus(sib || parent, {
              scroll: false
            });
            tree.delete(node2);
          }
        }
        return;
      }
      if (e2.key === "Tab" && !e2.shiftKey) {
        e2.preventDefault();
        focusNextElement(e2.currentTarget);
        return;
      }
      if (e2.key === "Tab" && e2.shiftKey) {
        e2.preventDefault();
        focusPrevElement(e2.currentTarget);
        return;
      }
      if (e2.key === "ArrowDown") {
        e2.preventDefault();
        const next = tree.nextNode;
        if (e2.metaKey) {
          tree.select(tree.focusedNode);
          tree.activate(tree.focusedNode);
          return;
        } else if (!e2.shiftKey || tree.props.disableMultiSelection) {
          tree.focus(next);
          return;
        } else {
          if (!next) return;
          const current = tree.focusedNode;
          if (!current) {
            tree.focus(tree.firstNode);
          } else if (current.isSelected) {
            tree.selectContiguous(next);
          } else {
            tree.selectMulti(next);
          }
          return;
        }
      }
      if (e2.key === "ArrowUp") {
        e2.preventDefault();
        const prev = tree.prevNode;
        if (!e2.shiftKey || tree.props.disableMultiSelection) {
          tree.focus(prev);
          return;
        } else {
          if (!prev) return;
          const current = tree.focusedNode;
          if (!current) {
            tree.focus(tree.lastNode);
          } else if (current.isSelected) {
            tree.selectContiguous(prev);
          } else {
            tree.selectMulti(prev);
          }
          return;
        }
      }
      if (e2.key === "ArrowRight") {
        const node2 = tree.focusedNode;
        if (!node2) return;
        if (node2.isInternal && node2.isOpen) {
          tree.focus(tree.nextNode);
        } else if (node2.isInternal) tree.open(node2.id);
        return;
      }
      if (e2.key === "ArrowLeft") {
        const node2 = tree.focusedNode;
        if (!node2 || node2.isRoot) return;
        if (node2.isInternal && node2.isOpen) tree.close(node2.id);
        else if (!((_a = node2.parent) === null || _a === void 0 ? void 0 : _a.isRoot)) {
          tree.focus(node2.parent);
        }
        return;
      }
      if (e2.key === "a" && e2.metaKey && !tree.props.disableMultiSelection) {
        e2.preventDefault();
        tree.selectAll();
        return;
      }
      if (e2.key === "a" && !e2.metaKey && tree.props.onCreate) {
        tree.createLeaf();
        return;
      }
      if (e2.key === "A" && !e2.metaKey) {
        if (!tree.props.onCreate) return;
        tree.createInternal();
        return;
      }
      if (e2.key === "Home") {
        e2.preventDefault();
        tree.focus(tree.firstNode);
        return;
      }
      if (e2.key === "End") {
        e2.preventDefault();
        tree.focus(tree.lastNode);
        return;
      }
      if (e2.key === "Enter") {
        const node2 = tree.focusedNode;
        if (!node2) return;
        if (!node2.isEditable || !tree.props.onRename) return;
        setTimeout(() => {
          if (node2) tree.edit(node2);
        });
        return;
      }
      if (e2.key === " ") {
        e2.preventDefault();
        const node2 = tree.focusedNode;
        if (!node2) return;
        if (node2.isLeaf) {
          node2.select();
          node2.activate();
        } else {
          node2.toggle();
        }
        return;
      }
      if (e2.key === "*") {
        const node2 = tree.focusedNode;
        if (!node2) return;
        tree.openSiblings(node2);
        return;
      }
      if (e2.key === "PageUp") {
        e2.preventDefault();
        tree.pageUp();
        return;
      }
      if (e2.key === "PageDown") {
        e2.preventDefault();
        tree.pageDown();
      }
      clearTimeout(timeoutId);
      focusSearchTerm += e2.key;
      timeoutId = setTimeout(() => {
        focusSearchTerm = "";
      }, 600);
      const node = tree.visibleNodes.find((n2) => {
        const name = n2.data.name;
        if (typeof name === "string") {
          return name.toLowerCase().startsWith(focusSearchTerm);
        } else return false;
      });
      if (node) tree.focus(node.id);
    },
    children: u$5(FixedSizeList, {
      className: tree.props.className,
      outerRef: tree.listEl,
      itemCount: tree.visibleNodes.length,
      height: tree.height,
      width: tree.width,
      itemSize: tree.rowHeight,
      overscanCount: tree.overscanCount,
      itemKey: (index) => {
        var _a;
        return ((_a = tree.visibleNodes[index]) === null || _a === void 0 ? void 0 : _a.id) || index;
      },
      outerElementType: ListOuterElement,
      innerElementType: ListInnerElement,
      onScroll: tree.props.onScroll,
      onItemsRendered: tree.onItemsRendered.bind(tree),
      ref: tree.list,
      children: RowContainer
    })
  });
}
function createList(tree) {
  if (tree.isFiltered) {
    return flattenAndFilterTree(tree.root, tree.isMatch.bind(tree));
  } else {
    return flattenTree(tree.root);
  }
}
function flattenTree(root2) {
  const list = [];
  function collect(node) {
    var _a;
    if (node.level >= 0) {
      list.push(node);
    }
    if (node.isOpen) {
      (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(collect);
    }
  }
  collect(root2);
  list.forEach(assignRowIndex);
  return list;
}
function flattenAndFilterTree(root2, isMatch) {
  const matches = {};
  const list = [];
  function markMatch(node) {
    const yes = !node.isRoot && isMatch(node);
    if (yes) {
      matches[node.id] = true;
      let parent = node.parent;
      while (parent) {
        matches[parent.id] = true;
        parent = parent.parent;
      }
    }
    if (node.children) {
      for (let child of node.children) markMatch(child);
    }
  }
  function collect(node) {
    var _a;
    if (node.level >= 0 && matches[node.id]) {
      list.push(node);
    }
    if (node.isOpen) {
      (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(collect);
    }
  }
  markMatch(root2);
  collect(root2);
  list.forEach(assignRowIndex);
  return list;
}
function assignRowIndex(node, index) {
  node.rowIndex = index;
}
const createIndex = (nodes) => {
  return nodes.reduce((map, node, index) => {
    map[node.id] = index;
    return map;
  }, {});
};
var __awaiter = function(thisArg, _arguments, P2, generator) {
  function adopt(value) {
    return value instanceof P2 ? value : new P2(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P2 || (P2 = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const {
  safeRun,
  identify,
  identifyNull
} = utils;
class TreeApi {
  constructor(store, props, list, listEl) {
    this.store = store;
    this.props = props;
    this.list = list;
    this.listEl = listEl;
    this.visibleStartIndex = 0;
    this.visibleStopIndex = 0;
    this.root = createRoot$1(this);
    this.visibleNodes = createList(this);
    this.idToIndex = createIndex(this.visibleNodes);
  }
  /* Changes here must also be made in constructor() */
  update(props) {
    this.props = props;
    this.root = createRoot$1(this);
    this.visibleNodes = createList(this);
    this.idToIndex = createIndex(this.visibleNodes);
  }
  /* Store helpers */
  dispatch(action) {
    return this.store.dispatch(action);
  }
  get state() {
    return this.store.getState();
  }
  get openState() {
    return this.state.nodes.open.unfiltered;
  }
  /* Tree Props */
  get width() {
    var _a;
    return (_a = this.props.width) !== null && _a !== void 0 ? _a : 300;
  }
  get height() {
    var _a;
    return (_a = this.props.height) !== null && _a !== void 0 ? _a : 500;
  }
  get indent() {
    var _a;
    return (_a = this.props.indent) !== null && _a !== void 0 ? _a : 24;
  }
  get rowHeight() {
    var _a;
    return (_a = this.props.rowHeight) !== null && _a !== void 0 ? _a : 24;
  }
  get overscanCount() {
    var _a;
    return (_a = this.props.overscanCount) !== null && _a !== void 0 ? _a : 1;
  }
  get searchTerm() {
    return (this.props.searchTerm || "").trim();
  }
  get matchFn() {
    var _a;
    const match = (_a = this.props.searchMatch) !== null && _a !== void 0 ? _a : (node, term) => {
      const string = JSON.stringify(Object.values(node.data));
      return string.toLocaleLowerCase().includes(term.toLocaleLowerCase());
    };
    return (node) => match(node, this.searchTerm);
  }
  accessChildren(data) {
    var _a;
    const get2 = this.props.childrenAccessor || "children";
    return (_a = access(data, get2)) !== null && _a !== void 0 ? _a : null;
  }
  accessId(data) {
    const get2 = this.props.idAccessor || "id";
    const id = access(data, get2);
    if (!id) throw new Error("Data must contain an 'id' property or props.idAccessor must return a string");
    return id;
  }
  /* Node Access */
  get firstNode() {
    var _a;
    return (_a = this.visibleNodes[0]) !== null && _a !== void 0 ? _a : null;
  }
  get lastNode() {
    var _a;
    return (_a = this.visibleNodes[this.visibleNodes.length - 1]) !== null && _a !== void 0 ? _a : null;
  }
  get focusedNode() {
    var _a;
    return (_a = this.get(this.state.nodes.focus.id)) !== null && _a !== void 0 ? _a : null;
  }
  get mostRecentNode() {
    var _a;
    return (_a = this.get(this.state.nodes.selection.mostRecent)) !== null && _a !== void 0 ? _a : null;
  }
  get nextNode() {
    const index = this.indexOf(this.focusedNode);
    if (index === null) return null;
    else return this.at(index + 1);
  }
  get prevNode() {
    const index = this.indexOf(this.focusedNode);
    if (index === null) return null;
    else return this.at(index - 1);
  }
  get(id) {
    if (!id) return null;
    if (id in this.idToIndex) return this.visibleNodes[this.idToIndex[id]] || null;
    else return null;
  }
  at(index) {
    return this.visibleNodes[index] || null;
  }
  nodesBetween(startId, endId) {
    var _a;
    if (startId === null || endId === null) return [];
    const index1 = (_a = this.indexOf(startId)) !== null && _a !== void 0 ? _a : 0;
    const index2 = this.indexOf(endId);
    if (index2 === null) return [];
    const start = Math.min(index1, index2);
    const end = Math.max(index1, index2);
    return this.visibleNodes.slice(start, end + 1);
  }
  indexOf(id) {
    const key = identifyNull$1(id);
    if (!key) return null;
    return this.idToIndex[key];
  }
  /* Data Operations */
  get editingId() {
    return this.state.nodes.edit.id;
  }
  createInternal() {
    return this.create({
      type: "internal"
    });
  }
  createLeaf() {
    return this.create({
      type: "leaf"
    });
  }
  create() {
    return __awaiter(this, arguments, void 0, function* (opts = {}) {
      var _a, _b;
      const parentId = opts.parentId === void 0 ? getInsertParentId(this) : opts.parentId;
      const index = (_a = opts.index) !== null && _a !== void 0 ? _a : getInsertIndex(this);
      const type = (_b = opts.type) !== null && _b !== void 0 ? _b : "leaf";
      const data = yield safeRun(this.props.onCreate, {
        type,
        parentId,
        index,
        parentNode: this.get(parentId)
      });
      if (data) {
        this.focus(data);
        setTimeout(() => {
          this.edit(data).then(() => {
            this.select(data);
            this.activate(data);
          });
        });
      }
    });
  }
  delete(node) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!node) return;
      const idents = Array.isArray(node) ? node : [node];
      const ids = idents.map(identify);
      const nodes = ids.map((id) => this.get(id)).filter((n2) => !!n2);
      yield safeRun(this.props.onDelete, {
        nodes,
        ids
      });
    });
  }
  edit(node) {
    const id = identify(node);
    this.resolveEdit({
      cancelled: true
    });
    this.scrollTo(id);
    this.dispatch(edit(id));
    return new Promise((resolve2) => {
      TreeApi.editPromise = resolve2;
    });
  }
  submit(identity2, value) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!identity2) return;
      const id = identify(identity2);
      yield safeRun(this.props.onRename, {
        id,
        name: value,
        node: this.get(id)
      });
      this.dispatch(edit(null));
      this.resolveEdit({
        cancelled: false,
        value
      });
      setTimeout(() => this.onFocus());
    });
  }
  reset() {
    this.dispatch(edit(null));
    this.resolveEdit({
      cancelled: true
    });
    setTimeout(() => this.onFocus());
  }
  activate(id) {
    const node = this.get(identifyNull(id));
    if (!node) return;
    safeRun(this.props.onActivate, node);
  }
  resolveEdit(value) {
    const resolve2 = TreeApi.editPromise;
    if (resolve2) resolve2(value);
    TreeApi.editPromise = null;
  }
  /* Focus and Selection */
  get selectedIds() {
    return this.state.nodes.selection.ids;
  }
  get selectedNodes() {
    let nodes = [];
    for (let id of Array.from(this.selectedIds)) {
      const node = this.get(id);
      if (node) nodes.push(node);
    }
    return nodes;
  }
  focus(node, opts = {}) {
    if (!node) return;
    if (this.props.selectionFollowsFocus) {
      this.select(node);
    } else {
      this.dispatch(focus(identify(node)));
      if (opts.scroll !== false) this.scrollTo(node);
      if (this.focusedNode) safeRun(this.props.onFocus, this.focusedNode);
    }
  }
  pageUp() {
    var _a, _b;
    const start = this.visibleStartIndex;
    const stop = this.visibleStopIndex;
    const page2 = stop - start;
    let index = (_b = (_a = this.focusedNode) === null || _a === void 0 ? void 0 : _a.rowIndex) !== null && _b !== void 0 ? _b : 0;
    if (index > start) {
      index = start;
    } else {
      index = Math.max(start - page2, 0);
    }
    this.focus(this.at(index));
  }
  pageDown() {
    var _a, _b;
    const start = this.visibleStartIndex;
    const stop = this.visibleStopIndex;
    const page2 = stop - start;
    let index = (_b = (_a = this.focusedNode) === null || _a === void 0 ? void 0 : _a.rowIndex) !== null && _b !== void 0 ? _b : 0;
    if (index < stop) {
      index = stop;
    } else {
      index = Math.min(index + page2, this.visibleNodes.length - 1);
    }
    this.focus(this.at(index));
  }
  select(node, opts = {}) {
    var _a;
    if (!node) return;
    const changeFocus = opts.focus !== false;
    const id = identify(node);
    if (changeFocus) this.dispatch(focus(id));
    if ((_a = this.get(id)) === null || _a === void 0 ? void 0 : _a.isSelectable) {
      this.setSelection({
        ids: [id],
        anchor: id,
        mostRecent: id
      });
    }
    this.scrollTo(id, opts.align);
    if (this.focusedNode && changeFocus) {
      safeRun(this.props.onFocus, this.focusedNode);
    }
  }
  deselect(node) {
    if (!node) return;
    const id = identify(node);
    this.dispatch(actions$1.remove(id));
    safeRun(this.props.onSelect, this.selectedNodes);
  }
  selectMulti(identity2, opts = {}) {
    const node = this.get(identifyNull(identity2));
    if (!node) return;
    const changeFocus = opts.focus !== false;
    if (changeFocus) this.dispatch(focus(node.id));
    if (node.isSelectable) {
      this.dispatch(actions$1.add(node.id));
      this.dispatch(actions$1.anchor(node.id));
      this.dispatch(actions$1.mostRecent(node.id));
    }
    this.scrollTo(node, opts.align);
    if (this.focusedNode && changeFocus) {
      safeRun(this.props.onFocus, this.focusedNode);
    }
    safeRun(this.props.onSelect, this.selectedNodes);
  }
  selectContiguous(identity2) {
    var _a;
    if (!identity2) return;
    const id = identify(identity2);
    this.dispatch(focus(id));
    if ((_a = this.get(id)) === null || _a === void 0 ? void 0 : _a.isSelectable) {
      const {
        anchor,
        mostRecent
      } = this.state.nodes.selection;
      const selectableNodes = this.filterSelectableNodes(this.nodesBetween(anchor, identifyNull(id)));
      this.dispatch(actions$1.remove(this.nodesBetween(anchor, mostRecent)));
      this.dispatch(actions$1.add(selectableNodes));
      this.dispatch(actions$1.mostRecent(id));
    }
    this.scrollTo(id);
    if (this.focusedNode) safeRun(this.props.onFocus, this.focusedNode);
    safeRun(this.props.onSelect, this.selectedNodes);
  }
  deselectAll() {
    this.setSelection({
      ids: [],
      anchor: null,
      mostRecent: null
    });
    safeRun(this.props.onSelect, this.selectedNodes);
  }
  selectAll() {
    var _a, _b, _c;
    const allSelectableNodes = this.filterSelectableNodes(Object.keys(this.idToIndex));
    this.setSelection({
      ids: allSelectableNodes,
      anchor: (_a = allSelectableNodes[0]) !== null && _a !== void 0 ? _a : null,
      mostRecent: (_b = allSelectableNodes[allSelectableNodes.length - 1]) !== null && _b !== void 0 ? _b : null
    });
    this.dispatch(focus((_c = this.lastNode) === null || _c === void 0 ? void 0 : _c.id));
    if (this.focusedNode) safeRun(this.props.onFocus, this.focusedNode);
    safeRun(this.props.onSelect, this.selectedNodes);
  }
  filterSelectableNodes(nodes) {
    return nodes.map((n2) => this.get(identify(n2))).filter((n2) => !!n2 && n2.isSelectable);
  }
  setSelection(args) {
    var _a;
    const ids = new Set((_a = args.ids) === null || _a === void 0 ? void 0 : _a.map(identify));
    const anchor = identifyNull(args.anchor);
    const mostRecent = identifyNull(args.mostRecent);
    this.dispatch(actions$1.set({
      ids,
      anchor,
      mostRecent
    }));
    safeRun(this.props.onSelect, this.selectedNodes);
  }
  /* Drag and Drop */
  get cursorParentId() {
    const {
      cursor
    } = this.state.dnd;
    switch (cursor.type) {
      case "highlight":
        return cursor.id;
      default:
        return null;
    }
  }
  get cursorOverFolder() {
    return this.state.dnd.cursor.type === "highlight";
  }
  get dragNodes() {
    return this.state.dnd.dragIds.map((id) => this.get(id)).filter((n2) => !!n2);
  }
  get dragNode() {
    return this.get(this.state.nodes.drag.id);
  }
  get dragDestinationParent() {
    return this.get(this.state.nodes.drag.destinationParentId);
  }
  get dragDestinationIndex() {
    return this.state.nodes.drag.destinationIndex;
  }
  canDrop() {
    var _a;
    if (this.isFiltered) return false;
    const parentNode = (_a = this.get(this.state.dnd.parentId)) !== null && _a !== void 0 ? _a : this.root;
    const dragNodes = this.dragNodes;
    const isDisabled = this.props.disableDrop;
    for (const drag of dragNodes) {
      if (!drag) return false;
      if (!parentNode) return false;
      if (drag.isInternal && isDescendant(parentNode, drag)) return false;
    }
    if (typeof isDisabled == "function") {
      return !isDisabled({
        parentNode,
        dragNodes: this.dragNodes,
        index: this.state.dnd.index || 0
      });
    } else if (typeof isDisabled == "string") {
      return !parentNode.data[isDisabled];
    } else if (typeof isDisabled === "boolean") {
      return !isDisabled;
    } else {
      return true;
    }
  }
  hideCursor() {
    this.dispatch(actions.cursor({
      type: "none"
    }));
  }
  showCursor(cursor) {
    this.dispatch(actions.cursor(cursor));
  }
  /* Visibility */
  open(identity2) {
    const id = identifyNull(identity2);
    if (!id) return;
    if (this.isOpen(id)) return;
    this.dispatch(actions$2.open(id, this.isFiltered));
    safeRun(this.props.onToggle, id);
  }
  close(identity2) {
    const id = identifyNull(identity2);
    if (!id) return;
    if (!this.isOpen(id)) return;
    this.dispatch(actions$2.close(id, this.isFiltered));
    safeRun(this.props.onToggle, id);
  }
  toggle(identity2) {
    const id = identifyNull(identity2);
    if (!id) return;
    return this.isOpen(id) ? this.close(id) : this.open(id);
  }
  openParents(identity2) {
    const id = identifyNull(identity2);
    if (!id) return;
    const node = dfs(this.root, id);
    let parent = node === null || node === void 0 ? void 0 : node.parent;
    while (parent) {
      this.open(parent.id);
      parent = parent.parent;
    }
  }
  openSiblings(node) {
    const parent = node.parent;
    if (!parent) {
      this.toggle(node.id);
    } else if (parent.children) {
      const isOpen = node.isOpen;
      for (let sibling of parent.children) {
        if (sibling.isInternal) {
          isOpen ? this.close(sibling.id) : this.open(sibling.id);
        }
      }
      this.scrollTo(this.focusedNode);
    }
  }
  openAll() {
    walk(this.root, (node) => {
      if (node.isInternal) node.open();
    });
  }
  closeAll() {
    walk(this.root, (node) => {
      if (node.isInternal) node.close();
    });
  }
  /* Scrolling */
  scrollTo(identity2, align = "smart") {
    if (!identity2) return;
    const id = identify(identity2);
    this.openParents(id);
    return waitFor(() => id in this.idToIndex).then(() => {
      var _a;
      const index = this.idToIndex[id];
      if (index === void 0) return;
      (_a = this.list.current) === null || _a === void 0 ? void 0 : _a.scrollToItem(index, align);
    }).catch(() => {
    });
  }
  /* State Checks */
  get isEditing() {
    return this.state.nodes.edit.id !== null;
  }
  get isFiltered() {
    var _a;
    return !!((_a = this.props.searchTerm) === null || _a === void 0 ? void 0 : _a.trim());
  }
  get hasFocus() {
    return this.state.nodes.focus.treeFocused;
  }
  get hasNoSelection() {
    return this.state.nodes.selection.ids.size === 0;
  }
  get hasOneSelection() {
    return this.state.nodes.selection.ids.size === 1;
  }
  get hasMultipleSelections() {
    return this.state.nodes.selection.ids.size > 1;
  }
  isSelected(id) {
    if (!id) return false;
    return this.state.nodes.selection.ids.has(id);
  }
  isOpen(id) {
    var _a, _b, _c;
    if (!id) return false;
    if (id === ROOT_ID) return true;
    const def = (_a = this.props.openByDefault) !== null && _a !== void 0 ? _a : true;
    if (this.isFiltered) {
      return (_b = this.state.nodes.open.filtered[id]) !== null && _b !== void 0 ? _b : true;
    } else {
      return (_c = this.state.nodes.open.unfiltered[id]) !== null && _c !== void 0 ? _c : def;
    }
  }
  isEditable(data) {
    return this.isActionPossible(data, this.props.disableEdit);
  }
  isDraggable(data) {
    return this.isActionPossible(data, this.props.disableDrag);
  }
  isSelectable(data) {
    return this.isActionPossible(data, this.props.disableSelect);
  }
  isActionPossible(data, disabler = () => false) {
    return !access(data, disabler);
  }
  isDragging(node) {
    const id = identifyNull(node);
    if (!id) return false;
    return this.state.nodes.drag.id === id;
  }
  isFocused(id) {
    return this.hasFocus && this.state.nodes.focus.id === id;
  }
  isMatch(node) {
    return this.matchFn(node);
  }
  willReceiveDrop(node) {
    const id = identifyNull(node);
    if (!id) return false;
    const {
      destinationParentId,
      destinationIndex
    } = this.state.nodes.drag;
    return id === destinationParentId && destinationIndex === null;
  }
  /* Tree Event Handlers */
  onFocus() {
    const node = this.focusedNode || this.firstNode;
    if (node) this.dispatch(focus(node.id));
  }
  onBlur() {
    this.dispatch(treeBlur());
  }
  onItemsRendered(args) {
    this.visibleStartIndex = args.visibleStartIndex;
    this.visibleStopIndex = args.visibleStopIndex;
  }
  /* Get Renderers */
  get renderContainer() {
    return this.props.renderContainer || DefaultContainer;
  }
  get renderRow() {
    return this.props.renderRow || DefaultRow;
  }
  get renderNode() {
    return this.props.children || DefaultNode;
  }
  get renderDragPreview() {
    return this.props.renderDragPreview || DefaultDragPreview;
  }
  get renderCursor() {
    return this.props.renderCursor || DefaultCursor;
  }
}
function formatProdErrorMessage(code2) {
  return `Minified Redux error #${code2}; visit https://redux.js.org/Errors?code=${code2} for the full message or use the non-minified dev environment for full errors. `;
}
var $$observable = /* @__PURE__ */ (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
var symbol_observable_default = $$observable;
var randomString2 = () => Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
  INIT: `@@redux/INIT${/* @__PURE__ */ randomString2()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString2()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString2()}`
};
var actionTypes_default = ActionTypes;
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
function createStore(reducer2, preloadedState, enhancer) {
  if (typeof reducer2 !== "function") {
    throw new Error(formatProdErrorMessage(2));
  }
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error(formatProdErrorMessage(0));
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(formatProdErrorMessage(1));
    }
    return enhancer(createStore)(reducer2, preloadedState);
  }
  let currentReducer = reducer2;
  let currentState = preloadedState;
  let currentListeners = /* @__PURE__ */ new Map();
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = /* @__PURE__ */ new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(3));
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(formatProdErrorMessage(4));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(5));
    }
    let isSubscribed = true;
    ensureCanMutateNextListeners();
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error(formatProdErrorMessage(6));
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(formatProdErrorMessage(7));
    }
    if (typeof action.type === "undefined") {
      throw new Error(formatProdErrorMessage(8));
    }
    if (typeof action.type !== "string") {
      throw new Error(formatProdErrorMessage(17));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(9));
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    const listeners = currentListeners = nextListeners;
    listeners.forEach((listener) => {
      listener();
    });
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(formatProdErrorMessage(10));
    }
    currentReducer = nextReducer;
    dispatch({
      type: actionTypes_default.REPLACE
    });
  }
  function observable() {
    const outerSubscribe = subscribe;
    return {
      /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(formatProdErrorMessage(11));
        }
        function observeState() {
          const observerAsObserver = observer;
          if (observerAsObserver.next) {
            observerAsObserver.next(getState());
          }
        }
        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      },
      [symbol_observable_default]() {
        return this;
      }
    };
  }
  dispatch({
    type: actionTypes_default.INIT
  });
  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [symbol_observable_default]: observable
  };
  return store;
}
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer2 = reducers[key];
    const initialState2 = reducer2(void 0, {
      type: actionTypes_default.INIT
    });
    if (typeof initialState2 === "undefined") {
      throw new Error(formatProdErrorMessage(12));
    }
    if (typeof reducer2(void 0, {
      type: actionTypes_default.PROBE_UNKNOWN_ACTION()
    }) === "undefined") {
      throw new Error(formatProdErrorMessage(13));
    }
  });
}
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  for (let i2 = 0; i2 < reducerKeys.length; i2++) {
    const key = reducerKeys[i2];
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);
  let shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e2) {
    shapeAssertionError = e2;
  }
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }
    let hasChanged = false;
    const nextState = {};
    for (let i2 = 0; i2 < finalReducerKeys.length; i2++) {
      const key = finalReducerKeys[i2];
      const reducer2 = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer2(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        action && action.type;
        throw new Error(formatProdErrorMessage(14));
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}
function reducer(state = initialState$2().nodes.drag, action) {
  switch (action.type) {
    case "DND_DRAG_START":
      return Object.assign(Object.assign({}, state), {
        id: action.id,
        selectedIds: action.dragIds
      });
    case "DND_DRAG_END":
      return Object.assign(Object.assign({}, state), {
        id: null,
        destinationParentId: null,
        destinationIndex: null,
        selectedIds: []
      });
    case "DND_HOVERING":
      if (action.parentId !== state.destinationParentId || action.index != state.destinationIndex) {
        return Object.assign(Object.assign({}, state), {
          destinationParentId: action.parentId,
          destinationIndex: action.index
        });
      } else {
        return state;
      }
    default:
      return state;
  }
}
const rootReducer = combineReducers({
  nodes: combineReducers({
    focus: reducer$4,
    edit: reducer$5,
    open: reducer$3,
    selection: reducer$2,
    drag: reducer
  }),
  dnd: reducer$1
});
const SERVER_STATE = initialState$2();
function TreeProvider({
  treeProps,
  imperativeHandle,
  children
}) {
  const list = A$6(null);
  const listEl = A$6(null);
  const store = A$6(
    // @ts-ignore
    createStore(rootReducer, initialState$2(treeProps))
  );
  const state = _useSyncExternalStore$1(store.current.subscribe, store.current.getState, () => SERVER_STATE);
  const api = T$4(() => {
    return new TreeApi(store.current, treeProps, list, listEl);
  }, []);
  const updateCount = A$6(0);
  T$4(() => {
    updateCount.current += 1;
    api.update(treeProps);
  }, [...Object.values(treeProps)]);
  T$4(() => {
    updateCount.current += 1;
    api.update(api.props);
  }, [state.nodes.open]);
  F$5(imperativeHandle, () => api);
  y$4(() => {
    if (api.props.selection) {
      api.select(api.props.selection, {
        focus: false
      });
    } else {
      api.deselectAll();
    }
  }, [api.props.selection]);
  y$4(() => {
    if (!api.props.searchTerm) {
      store.current.dispatch(actions$2.clear(true));
    }
  }, [api.props.searchTerm]);
  return u$5(TreeApiContext.Provider, {
    value: api,
    children: u$5(DataUpdatesContext.Provider, {
      value: updateCount.current,
      children: u$5(NodesContext.Provider, {
        value: state.nodes,
        children: u$5(DndContext$1.Provider, {
          value: state.dnd,
          children: u$5(DndProvider, Object.assign({}, treeProps.dndManager ? {
            manager: treeProps.dndManager
          } : {
            backend: treeProps.dndBackend || HTML5Backend,
            options: {
              rootElement: api.props.dndRootElement || void 0
            }
          }, {
            children
          }))
        })
      })
    })
  });
}
function useOuterDrop() {
  const tree = useTreeApi();
  const [, drop] = useDrop(() => ({
    accept: "NODE",
    canDrop: (_item, m2) => {
      if (!m2.isOver({
        shallow: true
      })) return false;
      return tree.canDrop();
    },
    hover: (_item, m2) => {
      if (!m2.isOver({
        shallow: true
      })) return;
      const offset = m2.getClientOffset();
      if (!tree.listEl.current || !offset) return;
      const {
        cursor,
        drop: drop2
      } = computeDrop({
        element: tree.listEl.current,
        offset,
        indent: tree.indent,
        node: null,
        prevNode: tree.visibleNodes[tree.visibleNodes.length - 1],
        nextNode: null
      });
      if (drop2) tree.dispatch(actions.hovering(drop2.parentId, drop2.index));
      if (m2.canDrop()) {
        if (cursor) tree.showCursor(cursor);
      } else {
        tree.hideCursor();
      }
    }
  }), [tree]);
  drop(tree.listEl);
}
function OuterDrop(props) {
  useOuterDrop();
  return props.children;
}
function TreeContainer() {
  const tree = useTreeApi();
  const Container = tree.props.renderContainer || DefaultContainer;
  return u$5(S$1, {
    children: u$5(Container, {})
  });
}
function DragPreviewContainer() {
  const tree = useTreeApi();
  const {
    offset,
    mouse,
    item,
    isDragging
  } = useDragLayer((m2) => {
    return {
      offset: m2.getSourceClientOffset(),
      mouse: m2.getClientOffset(),
      item: m2.getItem(),
      isDragging: m2.isDragging()
    };
  });
  const DragPreview = tree.props.renderDragPreview || DefaultDragPreview;
  return u$5(DragPreview, {
    offset,
    mouse,
    id: (item === null || item === void 0 ? void 0 : item.id) || null,
    dragIds: (item === null || item === void 0 ? void 0 : item.dragIds) || [],
    isDragging
  });
}
class SimpleTree {
  constructor(data) {
    this.root = createRoot(data);
  }
  get data() {
    var _a, _b;
    return (_b = (_a = this.root.children) === null || _a === void 0 ? void 0 : _a.map((node) => node.data)) !== null && _b !== void 0 ? _b : [];
  }
  create(args) {
    const parent = args.parentId ? this.find(args.parentId) : this.root;
    if (!parent) return null;
    parent.addChild(args.data, args.index);
  }
  move(args) {
    const src = this.find(args.id);
    const parent = args.parentId ? this.find(args.parentId) : this.root;
    if (!src || !parent) return;
    parent.addChild(src.data, args.index);
    src.drop();
  }
  update(args) {
    const node = this.find(args.id);
    if (node) node.update(args.changes);
  }
  drop(args) {
    const node = this.find(args.id);
    if (node) node.drop();
  }
  find(id, node = this.root) {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = this.find(id, child);
        if (found) return found;
      }
      return null;
    }
    return null;
  }
}
function createRoot(data) {
  const root2 = new SimpleNode({
    id: "ROOT"
  }, null);
  root2.children = data.map((d2) => createNode(d2, root2));
  return root2;
}
function createNode(data, parent) {
  const node = new SimpleNode(data, parent);
  if (data.children) node.children = data.children.map((d2) => createNode(d2, node));
  return node;
}
class SimpleNode {
  constructor(data, parent) {
    this.data = data;
    this.parent = parent;
    this.id = data.id;
  }
  hasParent() {
    return !!this.parent;
  }
  get childIndex() {
    return this.hasParent() ? this.parent.children.indexOf(this) : -1;
  }
  addChild(data, index) {
    var _a, _b;
    const node = createNode(data, this);
    this.children = (_a = this.children) !== null && _a !== void 0 ? _a : [];
    this.children.splice(index, 0, node);
    this.data.children = (_b = this.data.children) !== null && _b !== void 0 ? _b : [];
    this.data.children.splice(index, 0, data);
  }
  removeChild(index) {
    var _a, _b;
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
    (_b = this.data.children) === null || _b === void 0 ? void 0 : _b.splice(index, 1);
  }
  update(changes) {
    if (this.hasParent()) {
      const i2 = this.childIndex;
      this.parent.addChild(Object.assign(Object.assign({}, this.data), changes), i2);
      this.drop();
    }
  }
  drop() {
    if (this.hasParent()) this.parent.removeChild(this.childIndex);
  }
}
let nextId = 0;
function useSimpleTree(initialData) {
  const [data, setData] = d$4(initialData);
  const tree = T$4(() => new SimpleTree(data), [data]);
  const onMove = (args) => {
    for (const id of args.dragIds) {
      tree.move({
        id,
        parentId: args.parentId,
        index: args.index
      });
    }
    setData(tree.data);
  };
  const onRename = ({
    name,
    id
  }) => {
    tree.update({
      id,
      changes: {
        name
      }
    });
    setData(tree.data);
  };
  const onCreate = ({
    parentId,
    index,
    type
  }) => {
    const data2 = {
      id: `simple-tree-id-${nextId++}`,
      name: ""
    };
    if (type === "internal") data2.children = [];
    tree.create({
      parentId,
      index,
      data: data2
    });
    setData(tree.data);
    return data2;
  };
  const onDelete = (args) => {
    args.ids.forEach((id) => tree.drop({
      id
    }));
    setData(tree.data);
  };
  const controller = {
    onMove,
    onRename,
    onCreate,
    onDelete
  };
  return [data, controller];
}
function useValidatedProps(props) {
  if (props.initialData && props.data) {
    throw new Error(`React Arborist Tree => Provide either a data or initialData prop, but not both.`);
  }
  if (props.initialData && (props.onCreate || props.onDelete || props.onMove || props.onRename)) {
    throw new Error(`React Arborist Tree => You passed the initialData prop along with a data handler.
Use the data prop if you want to provide your own handlers.`);
  }
  if (props.initialData) {
    const [data, controller] = useSimpleTree(props.initialData);
    return Object.assign(Object.assign(Object.assign({}, props), controller), {
      data
    });
  } else {
    return props;
  }
}
function TreeComponent(props, ref) {
  const treeProps = useValidatedProps(props);
  return u$5(TreeProvider, {
    treeProps,
    imperativeHandle: ref,
    children: [u$5(OuterDrop, {
      children: u$5(TreeContainer, {})
    }), u$5(DragPreviewContainer, {})]
  });
}
D$3(TreeComponent);
function createFormatErrorMessage(baseUrl, prefix) {
  return function formatErrorMessage2(code2, ...args) {
    const url = new URL(baseUrl);
    url.searchParams.set("code", code2.toString());
    args.forEach((arg) => url.searchParams.append("args[]", arg));
    return `${prefix} error #${code2}; visit ${url} for the full message.`;
  };
}
const formatErrorMessage = createFormatErrorMessage("https://base-ui.com/production-error", "Base UI");
const DialogRootContext = /* @__PURE__ */ X$2(void 0);
function useDialogRootContext(optional) {
  const dialogRootContext = x$2(DialogRootContext);
  return dialogRootContext;
}
const UNINITIALIZED = {};
function useRefWithInit(init, initArg) {
  const ref = A$2(UNINITIALIZED);
  if (ref.current === UNINITIALIZED) {
    ref.current = init(initArg);
  }
  return ref;
}
function useMergedRefs(a2, b2, c2, d2) {
  const forkRef = useRefWithInit(createForkRef).current;
  if (didChange(forkRef, a2, b2, c2, d2)) {
    update(forkRef, [a2, b2, c2, d2]);
  }
  return forkRef.callback;
}
function useMergedRefsN(refs) {
  const forkRef = useRefWithInit(createForkRef).current;
  if (didChangeN(forkRef, refs)) {
    update(forkRef, refs);
  }
  return forkRef.callback;
}
function createForkRef() {
  return {
    callback: null,
    cleanup: null,
    refs: []
  };
}
function didChange(forkRef, a2, b2, c2, d2) {
  return forkRef.refs[0] !== a2 || forkRef.refs[1] !== b2 || forkRef.refs[2] !== c2 || forkRef.refs[3] !== d2;
}
function didChangeN(forkRef, newRefs) {
  return forkRef.refs.length !== newRefs.length || forkRef.refs.some((ref, index) => ref !== newRefs[index]);
}
function update(forkRef, refs) {
  forkRef.refs = refs;
  if (refs.every((ref) => ref == null)) {
    forkRef.callback = null;
    return;
  }
  forkRef.callback = (instance) => {
    if (forkRef.cleanup) {
      forkRef.cleanup();
      forkRef.cleanup = null;
    }
    if (instance != null) {
      const cleanupCallbacks = Array(refs.length).fill(null);
      for (let i2 = 0; i2 < refs.length; i2 += 1) {
        const ref = refs[i2];
        if (ref == null) {
          continue;
        }
        switch (typeof ref) {
          case "function": {
            const refCleanup = ref(instance);
            if (typeof refCleanup === "function") {
              cleanupCallbacks[i2] = refCleanup;
            }
            break;
          }
          case "object": {
            ref.current = instance;
            break;
          }
        }
      }
      forkRef.cleanup = () => {
        for (let i2 = 0; i2 < refs.length; i2 += 1) {
          const ref = refs[i2];
          if (ref == null) {
            continue;
          }
          switch (typeof ref) {
            case "function": {
              const cleanupCallback = cleanupCallbacks[i2];
              if (typeof cleanupCallback === "function") {
                cleanupCallback();
              } else {
                ref(null);
              }
              break;
            }
            case "object": {
              ref.current = null;
              break;
            }
          }
        }
      };
    }
  };
}
const majorVersion = parseInt(an, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
  return majorVersion >= reactVersionToCheck;
}
function getReactElementRef(element) {
  if (!/* @__PURE__ */ hn(element)) {
    return null;
  }
  const reactElement = element;
  const propsWithRef = reactElement.props;
  return (isReactVersionAtLeast(19) ? propsWithRef?.ref : reactElement.ref) ?? null;
}
function mergeObjects(a2, b2) {
  if (a2 && !b2) {
    return a2;
  }
  if (!a2 && b2) {
    return b2;
  }
  if (a2 || b2) {
    return {
      ...a2,
      ...b2
    };
  }
  return void 0;
}
function NOOP() {
}
const EMPTY_OBJECT = Object.freeze({});
function getStateAttributesProps(state, customMapping) {
  const props = {};
  for (const key in state) {
    const value = state[key];
    if (customMapping?.hasOwnProperty(key)) {
      const customProps = customMapping[key](value);
      if (customProps != null) {
        Object.assign(props, customProps);
      }
      continue;
    }
    if (value === true) {
      props[`data-${key.toLowerCase()}`] = "";
    } else if (value) {
      props[`data-${key.toLowerCase()}`] = value.toString();
    }
  }
  return props;
}
function resolveClassName(className, state) {
  return typeof className === "function" ? className(state) : className;
}
function resolveStyle(style, state) {
  return typeof style === "function" ? style(state) : style;
}
const EMPTY_PROPS = {};
function mergeProps(a2, b2, c2, d2, e2) {
  if (!c2 && !d2 && true && !a2) {
    return createInitialMergedProps(b2);
  }
  let merged = createInitialMergedProps(a2);
  if (b2) {
    merged = mergeInto(merged, b2);
  }
  if (c2) {
    merged = mergeInto(merged, c2);
  }
  if (d2) {
    merged = mergeInto(merged, d2);
  }
  return merged;
}
function mergePropsN(props) {
  if (props.length === 0) {
    return EMPTY_PROPS;
  }
  if (props.length === 1) {
    return createInitialMergedProps(props[0]);
  }
  let merged = createInitialMergedProps(props[0]);
  for (let i2 = 1; i2 < props.length; i2 += 1) {
    merged = mergeInto(merged, props[i2]);
  }
  return merged;
}
function createInitialMergedProps(inputProps) {
  if (isPropsGetter(inputProps)) {
    return {
      ...resolvePropsGetter(inputProps, EMPTY_PROPS)
    };
  }
  return copyInitialProps(inputProps);
}
function mergeInto(merged, inputProps) {
  if (isPropsGetter(inputProps)) {
    return resolvePropsGetter(inputProps, merged);
  }
  return mutablyMergeInto(merged, inputProps);
}
function copyInitialProps(inputProps) {
  const copiedProps = {
    ...inputProps
  };
  for (const propName in copiedProps) {
    const propValue = copiedProps[propName];
    if (isEventHandler(propName, propValue)) {
      copiedProps[propName] = wrapEventHandler(propValue);
    }
  }
  return copiedProps;
}
function mutablyMergeInto(mergedProps, externalProps) {
  if (!externalProps) {
    return mergedProps;
  }
  for (const propName in externalProps) {
    const externalPropValue = externalProps[propName];
    switch (propName) {
      case "style": {
        mergedProps[propName] = mergeObjects(mergedProps.style, externalPropValue);
        break;
      }
      case "className": {
        mergedProps[propName] = mergeClassNames(mergedProps.className, externalPropValue);
        break;
      }
      default: {
        if (isEventHandler(propName, externalPropValue)) {
          mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
        } else {
          mergedProps[propName] = externalPropValue;
        }
      }
    }
  }
  return mergedProps;
}
function isEventHandler(key, value) {
  const code0 = key.charCodeAt(0);
  const code1 = key.charCodeAt(1);
  const code2 = key.charCodeAt(2);
  return code0 === 111 && code1 === 110 && code2 >= 65 && code2 <= 90 && (typeof value === "function" || typeof value === "undefined");
}
function isPropsGetter(inputProps) {
  return typeof inputProps === "function";
}
function resolvePropsGetter(inputProps, previousProps) {
  if (isPropsGetter(inputProps)) {
    return inputProps(previousProps);
  }
  return inputProps ?? EMPTY_PROPS;
}
function mergeEventHandlers(ourHandler, theirHandler) {
  if (!theirHandler) {
    return ourHandler;
  }
  if (!ourHandler) {
    return wrapEventHandler(theirHandler);
  }
  return (...args) => {
    const event = args[0];
    if (isSyntheticEvent(event)) {
      const baseUIEvent = event;
      makeEventPreventable(baseUIEvent);
      const result2 = theirHandler(...args);
      if (!baseUIEvent.baseUIHandlerPrevented) {
        ourHandler?.(...args);
      }
      return result2;
    }
    const result = theirHandler(...args);
    ourHandler?.(...args);
    return result;
  };
}
function wrapEventHandler(handler2) {
  if (!handler2) {
    return handler2;
  }
  return (...args) => {
    const event = args[0];
    if (isSyntheticEvent(event)) {
      makeEventPreventable(event);
    }
    return handler2(...args);
  };
}
function makeEventPreventable(event) {
  event.preventBaseUIHandler = () => {
    event.baseUIHandlerPrevented = true;
  };
  return event;
}
function mergeClassNames(ourClassName, theirClassName) {
  if (theirClassName) {
    if (ourClassName) {
      return theirClassName + " " + ourClassName;
    }
    return theirClassName;
  }
  return ourClassName;
}
function isSyntheticEvent(event) {
  return event != null && typeof event === "object" && "nativeEvent" in event;
}
function useRenderElement(element, componentProps, params = {}) {
  const renderProp = componentProps.render;
  const outProps = useRenderElementProps(componentProps, params);
  if (params.enabled === false) {
    return null;
  }
  const state = params.state ?? EMPTY_OBJECT;
  return evaluateRenderProp(element, renderProp, outProps, state);
}
function useRenderElementProps(componentProps, params = {}) {
  const {
    className: classNameProp,
    style: styleProp,
    render: renderProp
  } = componentProps;
  const {
    state = EMPTY_OBJECT,
    ref,
    props,
    stateAttributesMapping: stateAttributesMapping2,
    enabled: enabled2 = true
  } = params;
  const className = enabled2 ? resolveClassName(classNameProp, state) : void 0;
  const style = enabled2 ? resolveStyle(styleProp, state) : void 0;
  const stateProps = enabled2 ? getStateAttributesProps(state, stateAttributesMapping2) : EMPTY_OBJECT;
  const resolvedProps = enabled2 && props ? resolveRenderFunctionProps(props) : void 0;
  const outProps = enabled2 ? mergeObjects(stateProps, resolvedProps) ?? {} : EMPTY_OBJECT;
  if (typeof document !== "undefined") {
    if (!enabled2) {
      useMergedRefs(null, null);
    } else if (Array.isArray(ref)) {
      outProps.ref = useMergedRefsN([outProps.ref, getReactElementRef(renderProp), ...ref]);
    } else {
      outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
    }
  }
  if (!enabled2) {
    return EMPTY_OBJECT;
  }
  if (className !== void 0) {
    outProps.className = mergeClassNames(outProps.className, className);
  }
  if (style !== void 0) {
    outProps.style = mergeObjects(outProps.style, style);
  }
  return outProps;
}
function resolveRenderFunctionProps(props) {
  if (Array.isArray(props)) {
    return mergePropsN(props);
  }
  return mergeProps(void 0, props);
}
const REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
function evaluateRenderProp(element, render, props, state) {
  if (render) {
    if (typeof render === "function") {
      return render(props, state);
    }
    const mergedProps = mergeProps(props, render.props);
    mergedProps.ref = props.ref;
    let newElement = render;
    if (newElement?.$$typeof === REACT_LAZY_TYPE) {
      const children = L.toArray(render);
      newElement = children[0];
    }
    return /* @__PURE__ */ mn(newElement, mergedProps);
  }
  if (element) {
    if (typeof element === "string") {
      return renderTag(element, props);
    }
  }
  throw new Error(formatErrorMessage(8));
}
function renderTag(Tag, props) {
  if (Tag === "button") {
    return /* @__PURE__ */ k$3("button", {
      type: "button",
      ...props,
      key: props.key
    });
  }
  if (Tag === "img") {
    return /* @__PURE__ */ k$3("img", {
      alt: "",
      ...props,
      key: props.key
    });
  }
  return /* @__PURE__ */ k$3(Tag, props);
}
let TransitionStatusDataAttributes = /* @__PURE__ */ (function(TransitionStatusDataAttributes2) {
  TransitionStatusDataAttributes2["startingStyle"] = "data-starting-style";
  TransitionStatusDataAttributes2["endingStyle"] = "data-ending-style";
  return TransitionStatusDataAttributes2;
})({});
const STARTING_HOOK = {
  [TransitionStatusDataAttributes.startingStyle]: ""
};
const ENDING_HOOK = {
  [TransitionStatusDataAttributes.endingStyle]: ""
};
const transitionStatusMapping = {
  transitionStatus(value) {
    if (value === "starting") {
      return STARTING_HOOK;
    }
    if (value === "ending") {
      return ENDING_HOOK;
    }
    return null;
  }
};
let CommonPopupDataAttributes = (function(CommonPopupDataAttributes2) {
  CommonPopupDataAttributes2["open"] = "data-open";
  CommonPopupDataAttributes2["closed"] = "data-closed";
  CommonPopupDataAttributes2[CommonPopupDataAttributes2["startingStyle"] = TransitionStatusDataAttributes.startingStyle] = "startingStyle";
  CommonPopupDataAttributes2[CommonPopupDataAttributes2["endingStyle"] = TransitionStatusDataAttributes.endingStyle] = "endingStyle";
  CommonPopupDataAttributes2["anchorHidden"] = "data-anchor-hidden";
  CommonPopupDataAttributes2["side"] = "data-side";
  CommonPopupDataAttributes2["align"] = "data-align";
  return CommonPopupDataAttributes2;
})({});
const POPUP_OPEN_HOOK = {
  [CommonPopupDataAttributes.open]: ""
};
const POPUP_CLOSED_HOOK = {
  [CommonPopupDataAttributes.closed]: ""
};
const ANCHOR_HIDDEN_HOOK = {
  [CommonPopupDataAttributes.anchorHidden]: ""
};
const popupStateMapping = {
  open(value) {
    if (value) {
      return POPUP_OPEN_HOOK;
    }
    return POPUP_CLOSED_HOOK;
  },
  anchorHidden(value) {
    if (value) {
      return ANCHOR_HIDDEN_HOOK;
    }
    return null;
  }
};
const stateAttributesMapping$1 = {
  ...popupStateMapping,
  ...transitionStatusMapping
};
const DialogBackdrop = /* @__PURE__ */ D(function DialogBackdrop2(componentProps, forwardedRef) {
  const {
    render,
    className,
    style,
    forceRender = false,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const open = store.useState("open");
  const nested = store.useState("nested");
  const mounted = store.useState("mounted");
  const transitionStatus = store.useState("transitionStatus");
  const state = {
    open,
    transitionStatus
  };
  return useRenderElement("div", componentProps, {
    state,
    ref: [store.context.backdropRef, forwardedRef],
    stateAttributesMapping: stateAttributesMapping$1,
    props: [{
      role: "presentation",
      hidden: !mounted,
      style: {
        userSelect: "none",
        WebkitUserSelect: "none"
      }
    }, elementProps],
    enabled: forceRender || !nested
  });
});
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
const useInsertionEffect = _mod$5[`useInsertionEffect${Math.random().toFixed(1)}`.slice(0, -3)];
const useSafeInsertionEffect = (
  // React 17 doesn't have useInsertionEffect.
  useInsertionEffect && // Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
  useInsertionEffect !== _ ? useInsertionEffect : (fn2) => fn2()
);
function useStableCallback(callback) {
  const stable = useRefWithInit(createStableCallback).current;
  stable.next = callback;
  useSafeInsertionEffect(stable.effect);
  return stable.trampoline;
}
function createStableCallback() {
  const stable = {
    next: void 0,
    callback: assertNotCalled,
    trampoline: (...args) => stable.callback?.(...args),
    effect: () => {
      stable.callback = stable.next;
    }
  };
  return stable;
}
function assertNotCalled() {
}
const SafeReact = {
  ..._mod$5
};
const noop = () => {
};
const useIsoLayoutEffect = typeof document !== "undefined" ? _ : noop;
const CompositeRootContext = /* @__PURE__ */ X$2(void 0);
function useCompositeRootContext(optional = false) {
  const context = x$2(CompositeRootContext);
  if (context === void 0 && !optional) {
    throw new Error(formatErrorMessage(16));
  }
  return context;
}
function useFocusableWhenDisabled(parameters) {
  const {
    focusableWhenDisabled,
    disabled,
    composite = false,
    tabIndex: tabIndexProp = 0,
    isNativeButton
  } = parameters;
  const isFocusableComposite = composite && focusableWhenDisabled !== false;
  const isNonFocusableComposite = composite && focusableWhenDisabled === false;
  const props = T$1(() => {
    const additionalProps = {
      // allow Tabbing away from focusableWhenDisabled elements
      onKeyDown(event) {
        if (disabled && focusableWhenDisabled && event.key !== "Tab") {
          event.preventDefault();
        }
      }
    };
    if (!composite) {
      additionalProps.tabIndex = tabIndexProp;
      if (!isNativeButton && disabled) {
        additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1;
      }
    }
    if (isNativeButton && (focusableWhenDisabled || isFocusableComposite) || !isNativeButton && disabled) {
      additionalProps["aria-disabled"] = disabled;
    }
    if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) {
      additionalProps.disabled = disabled;
    }
    return additionalProps;
  }, [composite, disabled, focusableWhenDisabled, isFocusableComposite, isNonFocusableComposite, isNativeButton, tabIndexProp]);
  return {
    props
  };
}
function useButton(parameters = {}) {
  const {
    disabled = false,
    focusableWhenDisabled,
    tabIndex = 0,
    native: isNativeButton = true,
    composite: compositeProp
  } = parameters;
  const elementRef = A$2(null);
  const compositeRootContext = useCompositeRootContext(true);
  const isCompositeItem = compositeProp ?? compositeRootContext !== void 0;
  const {
    props: focusableWhenDisabledProps
  } = useFocusableWhenDisabled({
    focusableWhenDisabled,
    disabled,
    composite: isCompositeItem,
    tabIndex,
    isNativeButton
  });
  const updateDisabled = q$2(() => {
    const element = elementRef.current;
    if (!isButtonElement(element)) {
      return;
    }
    if (isCompositeItem && disabled && focusableWhenDisabledProps.disabled === void 0 && element.disabled) {
      element.disabled = false;
    }
  }, [disabled, focusableWhenDisabledProps.disabled, isCompositeItem]);
  useIsoLayoutEffect(updateDisabled, [updateDisabled]);
  const getButtonProps = q$2((externalProps = {}) => {
    const {
      onClick: externalOnClick,
      onMouseDown: externalOnMouseDown,
      onKeyUp: externalOnKeyUp,
      onKeyDown: externalOnKeyDown,
      onPointerDown: externalOnPointerDown,
      ...otherExternalProps
    } = externalProps;
    const type = isNativeButton ? "button" : void 0;
    return mergeProps({
      type,
      onClick(event) {
        if (disabled) {
          event.preventDefault();
          return;
        }
        externalOnClick?.(event);
      },
      onMouseDown(event) {
        if (!disabled) {
          externalOnMouseDown?.(event);
        }
      },
      onKeyDown(event) {
        if (disabled) {
          return;
        }
        makeEventPreventable(event);
        externalOnKeyDown?.(event);
        if (event.baseUIHandlerPrevented) {
          return;
        }
        const isCurrentTarget = event.target === event.currentTarget;
        const currentTarget = event.currentTarget;
        const isButton = isButtonElement(currentTarget);
        const isLink = !isNativeButton && isValidLinkElement(currentTarget);
        const shouldClick = isCurrentTarget && (isNativeButton ? isButton : !isLink);
        const isEnterKey = event.key === "Enter";
        const isSpaceKey = event.key === " ";
        const role = currentTarget.getAttribute("role");
        const isTextNavigationRole = role?.startsWith("menuitem") || role === "option" || role === "gridcell";
        if (isCurrentTarget && isCompositeItem && isSpaceKey) {
          if (event.defaultPrevented && isTextNavigationRole) {
            return;
          }
          event.preventDefault();
          if (isLink || isNativeButton && isButton) {
            currentTarget.click();
            event.preventBaseUIHandler();
          } else if (shouldClick) {
            externalOnClick?.(event);
            event.preventBaseUIHandler();
          }
          return;
        }
        if (shouldClick) {
          if (!isNativeButton && (isSpaceKey || isEnterKey)) {
            event.preventDefault();
          }
          if (!isNativeButton && isEnterKey) {
            externalOnClick?.(event);
          }
        }
      },
      onKeyUp(event) {
        if (disabled) {
          return;
        }
        makeEventPreventable(event);
        externalOnKeyUp?.(event);
        if (event.target === event.currentTarget && isNativeButton && isCompositeItem && isButtonElement(event.currentTarget) && event.key === " ") {
          event.preventDefault();
          return;
        }
        if (event.baseUIHandlerPrevented) {
          return;
        }
        if (event.target === event.currentTarget && !isNativeButton && !isCompositeItem && event.key === " ") {
          externalOnClick?.(event);
        }
      },
      onPointerDown(event) {
        if (disabled) {
          event.preventDefault();
          return;
        }
        externalOnPointerDown?.(event);
      }
    }, !isNativeButton ? {
      role: "button"
    } : void 0, focusableWhenDisabledProps, otherExternalProps);
  }, [disabled, focusableWhenDisabledProps, isCompositeItem, isNativeButton]);
  const buttonRef = useStableCallback((element) => {
    elementRef.current = element;
    updateDisabled();
  });
  return {
    getButtonProps,
    buttonRef
  };
}
function isButtonElement(elem) {
  return isHTMLElement(elem) && elem.tagName === "BUTTON";
}
function isValidLinkElement(elem) {
  return Boolean(elem?.tagName === "A" && elem?.href);
}
const triggerHover = "trigger-hover";
const outsidePress = "outside-press";
const closePress = "close-press";
const focusOut = "focus-out";
function createChangeEventDetails(reason, event, trigger, customProperties) {
  let canceled = false;
  let allowPropagation = false;
  const custom = EMPTY_OBJECT;
  const details = {
    reason,
    event: event ?? new Event("base-ui"),
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      allowPropagation = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return allowPropagation;
    },
    trigger,
    ...custom
  };
  return details;
}
const DialogClose = /* @__PURE__ */ D(function DialogClose2(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    style,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const open = store.useState("open");
  function handleClick(event) {
    if (open) {
      store.setOpen(false, createChangeEventDetails(closePress, event.nativeEvent));
    }
  }
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const state = {
    disabled
  };
  return useRenderElement("button", componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [{
      onClick: handleClick
    }, elementProps, getButtonProps]
  });
});
let globalId = 0;
function useGlobalId(idOverride, prefix = "mui") {
  const [defaultId, setDefaultId] = d$1(idOverride);
  const id = idOverride || defaultId;
  y$1(() => {
    if (defaultId == null) {
      globalId += 1;
      setDefaultId(`${prefix}-${globalId}`);
    }
  }, [defaultId, prefix]);
  return id;
}
const maybeReactUseId = SafeReact.useId;
function useId(idOverride, prefix) {
  if (maybeReactUseId !== void 0) {
    const reactId = maybeReactUseId();
    return idOverride ?? (prefix ? `${prefix}-${reactId}` : reactId);
  }
  return useGlobalId(idOverride, prefix);
}
function useBaseUiId(idOverride) {
  return useId(idOverride, "base-ui");
}
const DialogDescription$1 = /* @__PURE__ */ D(function DialogDescription(componentProps, forwardedRef) {
  const {
    render,
    className,
    style,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const id = useBaseUiId(idProp);
  store.useSyncedValueWithCleanup("descriptionElementId", id);
  return useRenderElement("p", componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
});
const EMPTY$2 = [];
function useOnMount(fn2) {
  y$1(fn2, EMPTY$2);
}
const EMPTY$1 = 0;
class Timeout {
  static create() {
    return new Timeout();
  }
  currentId = EMPTY$1;
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(delay, fn2) {
    this.clear();
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY$1;
      fn2();
    }, delay);
  }
  isStarted() {
    return this.currentId !== EMPTY$1;
  }
  clear = () => {
    if (this.currentId !== EMPTY$1) {
      clearTimeout(this.currentId);
      this.currentId = EMPTY$1;
    }
  };
  disposeEffect = () => {
    return this.clear;
  };
}
function useTimeout() {
  const timeout = useRefWithInit(Timeout.create).current;
  useOnMount(timeout.disposeEffect);
  return timeout;
}
const hasNavigator = typeof navigator !== "undefined";
const nav = getNavigatorData();
const platform = getPlatform();
const userAgent = getUserAgent();
const isWebKit = typeof CSS === "undefined" || !CSS.supports ? false : CSS.supports("-webkit-backdrop-filter:none");
nav.platform === "MacIntel" && nav.maxTouchPoints > 1 ? true : /iP(hone|ad|od)|iOS/.test(nav.platform);
const isSafari = hasNavigator && /apple/i.test(navigator.vendor);
const isAndroid = hasNavigator && /android/i.test(platform) || /android/i.test(userAgent);
hasNavigator && platform.toLowerCase().startsWith("mac") && !navigator.maxTouchPoints;
const isJSDOM = userAgent.includes("jsdom/");
function getNavigatorData() {
  if (!hasNavigator) {
    return {
      platform: "",
      maxTouchPoints: -1
    };
  }
  const uaData = navigator.userAgentData;
  if (uaData?.platform) {
    return {
      platform: uaData.platform,
      maxTouchPoints: navigator.maxTouchPoints
    };
  }
  return {
    platform: navigator.platform ?? "",
    maxTouchPoints: navigator.maxTouchPoints ?? -1
  };
}
function getUserAgent() {
  if (!hasNavigator) {
    return "";
  }
  const uaData = navigator.userAgentData;
  if (uaData && Array.isArray(uaData.brands)) {
    return uaData.brands.map(({
      brand,
      version: version2
    }) => `${brand}/${version2}`).join(" ");
  }
  return navigator.userAgent;
}
function getPlatform() {
  if (!hasNavigator) {
    return "";
  }
  const uaData = navigator.userAgentData;
  if (uaData?.platform) {
    return uaData.platform;
  }
  return navigator.platform ?? "";
}
function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}
function isVirtualClick(event) {
  if (event.pointerType === "" && event.isTrusted) {
    return true;
  }
  if (isAndroid && event.pointerType) {
    return event.type === "click" && event.buttons === 1;
  }
  return event.detail === 0 && !event.pointerType;
}
function isVirtualPointerEvent(event) {
  if (isJSDOM) {
    return false;
  }
  return !isAndroid && event.width === 0 && event.height === 0 || isAndroid && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "mouse" || // iOS VoiceOver returns 0.333• for width/height.
  event.width < 1 && event.height < 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "touch";
}
var f = 0;
function u(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = {
    type: e2,
    props: p2,
    key: n2,
    ref: a2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: --f,
    __i: -1,
    __u: 0,
    __source: i2,
    __self: u2
  };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$2.vnode && l$2.vnode(l2), l2;
}
function addEventListener(target, type, listener, options2) {
  target.addEventListener(type, listener, options2);
  return () => {
    target.removeEventListener(type, listener, options2);
  };
}
function mergeCleanups(...cleanups) {
  return () => {
    for (let i2 = 0; i2 < cleanups.length; i2 += 1) {
      const cleanup = cleanups[i2];
      if (cleanup) {
        cleanup();
      }
    }
  };
}
function useValueAsRef(value) {
  const latest = useRefWithInit(createLatestRef, value).current;
  latest.next = value;
  useIsoLayoutEffect(latest.effect);
  return latest;
}
function createLatestRef(value) {
  const latest = {
    current: value,
    next: value,
    effect: () => {
      latest.current = latest.next;
    }
  };
  return latest;
}
const EMPTY = null;
class Scheduler {
  /* This implementation uses an array as a backing data-structure for frame callbacks.
   * It allows `O(1)` callback cancelling by inserting a `null` in the array, though it
   * never calls the native `cancelAnimationFrame` if there are no frames left. This can
   * be much more efficient if there is a call pattern that alterns as
   * "request-cancel-request-cancel-…".
   * But in the case of "request-request-…-cancel-cancel-…", it leaves the final animation
   * frame to run anyway. We turn that frame into a `O(1)` no-op via `callbacksCount`. */
  callbacks = [];
  callbacksCount = 0;
  nextId = 1;
  startId = 1;
  isScheduled = false;
  tick = (timestamp) => {
    this.isScheduled = false;
    const currentCallbacks = this.callbacks;
    const currentCallbacksCount = this.callbacksCount;
    this.callbacks = [];
    this.callbacksCount = 0;
    this.startId = this.nextId;
    if (currentCallbacksCount > 0) {
      for (let i2 = 0; i2 < currentCallbacks.length; i2 += 1) {
        currentCallbacks[i2]?.(timestamp);
      }
    }
  };
  request(fn2) {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.push(fn2);
    this.callbacksCount += 1;
    const didRAFChange = false;
    if (!this.isScheduled || didRAFChange) {
      requestAnimationFrame(this.tick);
      this.isScheduled = true;
    }
    return id;
  }
  cancel(id) {
    const index = id - this.startId;
    if (index < 0 || index >= this.callbacks.length) {
      return;
    }
    this.callbacks[index] = null;
    this.callbacksCount -= 1;
  }
}
const scheduler = new Scheduler();
class AnimationFrame {
  static create() {
    return new AnimationFrame();
  }
  static request(fn2) {
    return scheduler.request(fn2);
  }
  static cancel(id) {
    return scheduler.cancel(id);
  }
  currentId = EMPTY;
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  request(fn2) {
    this.cancel();
    this.currentId = scheduler.request(() => {
      this.currentId = EMPTY;
      fn2();
    });
  }
  cancel = () => {
    if (this.currentId !== EMPTY) {
      scheduler.cancel(this.currentId);
      this.currentId = EMPTY;
    }
  };
  disposeEffect = () => {
    return this.cancel;
  };
}
function useAnimationFrame() {
  const timeout = useRefWithInit(AnimationFrame.create).current;
  useOnMount(timeout.disposeEffect);
  return timeout;
}
function ownerDocument(node) {
  return node?.ownerDocument || document;
}
const visuallyHiddenBase = {
  clipPath: "inset(50%)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  border: 0,
  padding: 0,
  width: 1,
  height: 1,
  margin: -1
};
const visuallyHidden = {
  ...visuallyHiddenBase,
  position: "fixed",
  top: 0,
  left: 0
};
const FocusGuard = /* @__PURE__ */ D(function FocusGuard2(props, ref) {
  const [role, setRole] = d$1();
  useIsoLayoutEffect(() => {
    if (isSafari) {
      setRole("button");
    }
  }, []);
  const restProps = {
    tabIndex: 0,
    // Role is only for VoiceOver
    role
  };
  return /* @__PURE__ */ u("span", {
    ...props,
    ref,
    style: visuallyHidden,
    "aria-hidden": role ? void 0 : true,
    ...restProps,
    "data-base-ui-focus-guard": ""
  });
});
const FOCUSABLE_ATTRIBUTE = "data-base-ui-focusable";
const TYPEABLE_SELECTOR = "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";
function activeElement(doc) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}
function contains(parent, child) {
  if (!parent || !child) {
    return false;
  }
  const rootNode = child.getRootNode?.();
  if (parent.contains(child)) {
    return true;
  }
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next) {
        return true;
      }
      next = next.parentNode || next.host;
    }
  }
  return false;
}
function getTarget(event) {
  if ("composedPath" in event) {
    return event.composedPath()[0];
  }
  return event.target;
}
function isTypeableElement(element) {
  return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR);
}
function isTypeableCombobox(element) {
  if (!element) {
    return false;
  }
  return element.getAttribute("role") === "combobox" && isTypeableElement(element);
}
function getFloatingFocusElement(floatingElement) {
  if (!floatingElement) {
    return null;
  }
  return floatingElement.hasAttribute(FOCUSABLE_ATTRIBUTE) ? floatingElement : floatingElement.querySelector(`[${FOCUSABLE_ATTRIBUTE}]`) || floatingElement;
}
function isHiddenByStyles(styles) {
  return styles.visibility === "hidden" || styles.visibility === "collapse";
}
function isElementVisible(element, styles = element ? getComputedStyle(element) : null) {
  if (!element || !element.isConnected || !styles || isHiddenByStyles(styles)) {
    return false;
  }
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }
  return styles.display !== "none" && styles.display !== "contents";
}
const CANDIDATE_SELECTOR = 'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
function getParentElement(element) {
  const assignedSlot = element.assignedSlot;
  if (assignedSlot) {
    return assignedSlot;
  }
  if (element.parentElement) {
    return element.parentElement;
  }
  const rootNode = element.getRootNode();
  return isShadowRoot(rootNode) ? rootNode.host : null;
}
function getDetailsSummary(details) {
  for (const child of Array.from(details.children)) {
    if (getNodeName(child) === "summary") {
      return child;
    }
  }
  return null;
}
function isWithinOpenDetailsSummary(element, details) {
  const summary = getDetailsSummary(details);
  return !!summary && (element === summary || contains(summary, element));
}
function isFocusableCandidate(element) {
  const nodeName = element ? getNodeName(element) : "";
  return element != null && element.matches(CANDIDATE_SELECTOR) && (nodeName !== "summary" || element.parentElement != null && getNodeName(element.parentElement) === "details" && getDetailsSummary(element.parentElement) === element) && (nodeName !== "details" || getDetailsSummary(element) == null) && (nodeName !== "input" || element.type !== "hidden");
}
function isFocusableElement(element) {
  if (!isFocusableCandidate(element) || !element.isConnected || element.matches(":disabled")) {
    return false;
  }
  for (let current = element; current; current = getParentElement(current)) {
    const isAncestor = current !== element;
    const isSlot = getNodeName(current) === "slot";
    if (current.hasAttribute("inert")) {
      return false;
    }
    if (isAncestor && getNodeName(current) === "details" && !current.open && !isWithinOpenDetailsSummary(element, current) || current.hasAttribute("hidden") || !isSlot && !isVisibleInTabbableTree(current, isAncestor)) {
      return false;
    }
  }
  return true;
}
function isVisibleInTabbableTree(element, isAncestor) {
  const styles = getComputedStyle(element);
  if (!isAncestor) {
    return isElementVisible(element, styles);
  }
  return styles.display !== "none";
}
function getTabIndex(element) {
  const tabIndex = element.tabIndex;
  if (tabIndex < 0) {
    const nodeName = getNodeName(element);
    if (nodeName === "details" || nodeName === "audio" || nodeName === "video" || isHTMLElement(element) && element.isContentEditable) {
      return 0;
    }
  }
  return tabIndex;
}
function getNamedRadioInput(element) {
  if (getNodeName(element) !== "input") {
    return null;
  }
  const input = element;
  return input.type === "radio" && input.name !== "" ? input : null;
}
function isTabbableRadio(element, candidates) {
  const input = getNamedRadioInput(element);
  if (!input) {
    return true;
  }
  const checkedRadio = candidates.find((candidate) => {
    const radio = getNamedRadioInput(candidate);
    return radio?.name === input.name && radio.form === input.form && radio.checked;
  });
  if (checkedRadio) {
    return checkedRadio === input;
  }
  return candidates.find((candidate) => {
    const radio = getNamedRadioInput(candidate);
    return radio?.name === input.name && radio.form === input.form;
  }) === input;
}
function getComposedChildren(container) {
  if (isHTMLElement(container) && getNodeName(container) === "slot") {
    const assignedElements = container.assignedElements({
      flatten: true
    });
    if (assignedElements.length > 0) {
      return assignedElements;
    }
  }
  if (isHTMLElement(container) && container.shadowRoot) {
    return Array.from(container.shadowRoot.children);
  }
  return Array.from(container.children);
}
function appendCandidates(container, list) {
  getComposedChildren(container).forEach((child) => {
    if (isFocusableCandidate(child)) {
      list.push(child);
    }
    appendCandidates(child, list);
  });
}
function appendMatchingElements(container, selector, list) {
  getComposedChildren(container).forEach((child) => {
    if (isHTMLElement(child) && child.matches(selector)) {
      list.push(child);
    }
    appendMatchingElements(child, selector, list);
  });
}
function isTabbable(element) {
  return isFocusableElement(element) && getTabIndex(element) >= 0;
}
function focusable(container) {
  const candidates = [];
  appendCandidates(container, candidates);
  return candidates.filter(isFocusableElement);
}
function tabbable(container) {
  const candidates = focusable(container);
  return candidates.filter((element) => getTabIndex(element) >= 0 && isTabbableRadio(element, candidates));
}
function getTabbableIn(container, dir) {
  const list = tabbable(container);
  const len = list.length;
  if (len === 0) {
    return void 0;
  }
  const active = activeElement(ownerDocument(container));
  const index = list.indexOf(active);
  const nextIndex = index === -1 ? dir === 1 ? 0 : len - 1 : index + dir;
  return list[nextIndex];
}
function getNextTabbable(referenceElement) {
  return getTabbableIn(ownerDocument(referenceElement).body, 1) || referenceElement;
}
function getPreviousTabbable(referenceElement) {
  return getTabbableIn(ownerDocument(referenceElement).body, -1) || referenceElement;
}
function isOutsideEvent(event, container) {
  const containerElement = container || event.currentTarget;
  const relatedTarget = event.relatedTarget;
  return !relatedTarget || !contains(containerElement, relatedTarget);
}
function disableFocusInside(container) {
  const tabbableElements = tabbable(container);
  tabbableElements.forEach((element) => {
    element.dataset.tabindex = element.getAttribute("tabindex") || "";
    element.setAttribute("tabindex", "-1");
  });
}
function enableFocusInside(container) {
  const elements = [];
  appendMatchingElements(container, "[data-tabindex]", elements);
  elements.forEach((element) => {
    const tabindex = element.dataset.tabindex;
    delete element.dataset.tabindex;
    if (tabindex) {
      element.setAttribute("tabindex", tabindex);
    } else {
      element.removeAttribute("tabindex");
    }
  });
}
function getNodeChildren(nodes, id, onlyOpenChildren = true) {
  const directChildren = nodes.filter((node) => node.parentId === id);
  return directChildren.flatMap((child) => [...!onlyOpenChildren || child.context?.open ? [child] : [], ...getNodeChildren(nodes, child.id, onlyOpenChildren)]);
}
function getNodeAncestors(nodes, id) {
  let allAncestors = [];
  let currentParentId = nodes.find((node) => node.id === id)?.parentId;
  while (currentParentId) {
    const currentNode = nodes.find((node) => node.id === currentParentId);
    currentParentId = currentNode?.parentId;
    if (currentNode) {
      allAncestors = allAncestors.concat(currentNode);
    }
  }
  return allAncestors;
}
function createAttribute(name) {
  return `data-base-ui-${name}`;
}
let rafId = 0;
function enqueueFocus(el, options2 = {}) {
  const {
    preventScroll = false,
    cancelPrevious = true,
    sync = false
  } = options2;
  if (cancelPrevious) {
    cancelAnimationFrame(rafId);
  }
  const exec = () => el?.focus({
    preventScroll
  });
  if (sync) {
    exec();
    return NOOP;
  }
  const currentRafId = requestAnimationFrame(exec);
  rafId = currentRafId;
  return () => {
    if (rafId === currentRafId) {
      cancelAnimationFrame(currentRafId);
      rafId = 0;
    }
  };
}
const counters = {
  inert: /* @__PURE__ */ new WeakMap(),
  "aria-hidden": /* @__PURE__ */ new WeakMap()
};
const markerName = "data-base-ui-inert";
const uncontrolledElementsSets = {
  inert: /* @__PURE__ */ new WeakSet(),
  "aria-hidden": /* @__PURE__ */ new WeakSet()
};
let markerCounterMap = /* @__PURE__ */ new WeakMap();
let lockCount = 0;
function getUncontrolledElementsSet(controlAttribute) {
  return uncontrolledElementsSets[controlAttribute];
}
function unwrapHost(node) {
  if (!node) {
    return null;
  }
  return isShadowRoot(node) ? node.host : unwrapHost(node.parentNode);
}
const correctElements = (parent, targets) => targets.map((target) => {
  if (parent.contains(target)) {
    return target;
  }
  const correctedTarget = unwrapHost(target);
  if (parent.contains(correctedTarget)) {
    return correctedTarget;
  }
  return null;
}).filter((x2) => x2 != null);
const buildKeepSet = (targets) => {
  const keep = /* @__PURE__ */ new Set();
  targets.forEach((target) => {
    let node = target;
    while (node && !keep.has(node)) {
      keep.add(node);
      node = node.parentNode;
    }
  });
  return keep;
};
const collectOutsideElements = (root2, keepElements, stopElements) => {
  const outside = [];
  const walk2 = (parent) => {
    if (!parent || stopElements.has(parent)) {
      return;
    }
    Array.from(parent.children).forEach((node) => {
      if (getNodeName(node) === "script") {
        return;
      }
      if (keepElements.has(node)) {
        walk2(node);
      } else {
        outside.push(node);
      }
    });
  };
  walk2(root2);
  return outside;
};
function applyAttributeToOthers(uncorrectedAvoidElements, body, ariaHidden, inert, {
  mark = true,
  markerIgnoreElements = []
}) {
  const controlAttribute = inert ? "inert" : ariaHidden ? "aria-hidden" : null;
  let counterMap = null;
  let uncontrolledElementsSet = null;
  const avoidElements = correctElements(body, uncorrectedAvoidElements);
  const markerIgnoreTargets = mark ? correctElements(body, markerIgnoreElements) : [];
  const markerIgnoreSet = new Set(markerIgnoreTargets);
  const markerTargets = mark ? collectOutsideElements(body, buildKeepSet(avoidElements), new Set(avoidElements)).filter((target) => !markerIgnoreSet.has(target)) : [];
  const hiddenElements = [];
  const markedElements = [];
  if (controlAttribute) {
    const map = counters[controlAttribute];
    const currentUncontrolledElementsSet = getUncontrolledElementsSet(controlAttribute);
    uncontrolledElementsSet = currentUncontrolledElementsSet;
    counterMap = map;
    const ariaLiveElements = correctElements(body, Array.from(body.querySelectorAll("[aria-live]")));
    const controlElements = avoidElements.concat(ariaLiveElements);
    const controlTargets = collectOutsideElements(body, buildKeepSet(controlElements), new Set(controlElements));
    controlTargets.forEach((node) => {
      const attr2 = node.getAttribute(controlAttribute);
      const alreadyHidden = attr2 !== null && attr2 !== "false";
      const counterValue = (map.get(node) || 0) + 1;
      map.set(node, counterValue);
      hiddenElements.push(node);
      if (counterValue === 1 && alreadyHidden) {
        currentUncontrolledElementsSet.add(node);
      }
      if (!alreadyHidden) {
        node.setAttribute(controlAttribute, controlAttribute === "inert" ? "" : "true");
      }
    });
  }
  if (mark) {
    markerTargets.forEach((node) => {
      const markerValue = (markerCounterMap.get(node) || 0) + 1;
      markerCounterMap.set(node, markerValue);
      markedElements.push(node);
      if (markerValue === 1) {
        node.setAttribute(markerName, "");
      }
    });
  }
  lockCount += 1;
  return () => {
    if (counterMap) {
      hiddenElements.forEach((element) => {
        const currentCounterValue = counterMap.get(element) || 0;
        const counterValue = currentCounterValue - 1;
        counterMap.set(element, counterValue);
        if (!counterValue) {
          if (!uncontrolledElementsSet?.has(element) && controlAttribute) {
            element.removeAttribute(controlAttribute);
          }
          uncontrolledElementsSet?.delete(element);
        }
      });
    }
    if (mark) {
      markedElements.forEach((element) => {
        const markerValue = (markerCounterMap.get(element) || 0) - 1;
        markerCounterMap.set(element, markerValue);
        if (!markerValue) {
          element.removeAttribute(markerName);
        }
      });
    }
    lockCount -= 1;
    if (!lockCount) {
      counters.inert = /* @__PURE__ */ new WeakMap();
      counters["aria-hidden"] = /* @__PURE__ */ new WeakMap();
      uncontrolledElementsSets.inert = /* @__PURE__ */ new WeakSet();
      uncontrolledElementsSets["aria-hidden"] = /* @__PURE__ */ new WeakSet();
      markerCounterMap = /* @__PURE__ */ new WeakMap();
    }
  };
}
function markOthers(avoidElements, options2 = {}) {
  const {
    ariaHidden = false,
    inert = false,
    mark = true,
    markerIgnoreElements = []
  } = options2;
  const body = ownerDocument(avoidElements[0]).body;
  return applyAttributeToOthers(avoidElements, body, ariaHidden, inert, {
    mark,
    markerIgnoreElements
  });
}
const CLICK_TRIGGER_IDENTIFIER = "data-base-ui-click-trigger";
const ownerVisuallyHidden = {
  clipPath: "inset(50%)",
  position: "fixed",
  top: 0,
  left: 0
};
const PortalContext = /* @__PURE__ */ X$2(null);
const usePortalContext = () => x$2(PortalContext);
const attr = createAttribute("portal");
function useFloatingPortalNode(props = {}) {
  const {
    ref,
    container: containerProp,
    componentProps = EMPTY_OBJECT,
    elementProps
  } = props;
  const uniqueId = useId();
  const portalContext = usePortalContext();
  const parentPortalNode = portalContext?.portalNode;
  const [containerElement, setContainerElement] = d$1(null);
  const [portalNode, setPortalNode] = d$1(null);
  const setPortalNodeRef = useStableCallback((node) => {
    if (node !== null) {
      setPortalNode(node);
    }
  });
  const containerRef = A$2(null);
  useIsoLayoutEffect(() => {
    if (containerProp === null) {
      if (containerRef.current) {
        containerRef.current = null;
        setPortalNode(null);
        setContainerElement(null);
      }
      return;
    }
    if (uniqueId == null) {
      return;
    }
    const resolvedContainer = (containerProp && (isNode(containerProp) ? containerProp : containerProp.current)) ?? parentPortalNode ?? document.body;
    if (resolvedContainer == null) {
      if (containerRef.current) {
        containerRef.current = null;
        setPortalNode(null);
        setContainerElement(null);
      }
      return;
    }
    if (containerRef.current !== resolvedContainer) {
      containerRef.current = resolvedContainer;
      setPortalNode(null);
      setContainerElement(resolvedContainer);
    }
  }, [containerProp, parentPortalNode, uniqueId]);
  const portalElement = useRenderElement("div", componentProps, {
    ref: [ref, setPortalNodeRef],
    props: [{
      id: uniqueId,
      [attr]: ""
    }, elementProps]
  });
  const portalSubtree = containerElement && portalElement ? /* @__PURE__ */ $(portalElement, containerElement) : null;
  return {
    portalNode,
    portalSubtree
  };
}
const FloatingPortal = /* @__PURE__ */ D(function FloatingPortal2(componentProps, forwardedRef) {
  const {
    children,
    container,
    className,
    render,
    renderGuards,
    style,
    ...elementProps
  } = componentProps;
  const {
    portalNode,
    portalSubtree
  } = useFloatingPortalNode({
    container,
    ref: forwardedRef,
    componentProps,
    elementProps
  });
  const beforeOutsideRef = A$2(null);
  const afterOutsideRef = A$2(null);
  const beforeInsideRef = A$2(null);
  const afterInsideRef = A$2(null);
  const [focusManagerState, setFocusManagerState] = d$1(null);
  const focusInsideDisabledRef = A$2(false);
  const modal = focusManagerState?.modal;
  const open = focusManagerState?.open;
  const shouldRenderGuards = typeof renderGuards === "boolean" ? renderGuards : !!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode;
  y$1(() => {
    if (!portalNode || modal) {
      return void 0;
    }
    function onFocus(event) {
      if (portalNode && event.relatedTarget && isOutsideEvent(event)) {
        if (event.type === "focusin") {
          if (focusInsideDisabledRef.current) {
            enableFocusInside(portalNode);
            focusInsideDisabledRef.current = false;
          }
        } else {
          disableFocusInside(portalNode);
          focusInsideDisabledRef.current = true;
        }
      }
    }
    return mergeCleanups(addEventListener(portalNode, "focusin", onFocus, true), addEventListener(portalNode, "focusout", onFocus, true));
  }, [portalNode, modal]);
  y$1(() => {
    if (!portalNode || open !== false) {
      return;
    }
    enableFocusInside(portalNode);
    focusInsideDisabledRef.current = false;
  }, [open, portalNode]);
  const portalContextValue = T$1(() => ({
    beforeOutsideRef,
    afterOutsideRef,
    beforeInsideRef,
    afterInsideRef,
    portalNode,
    setFocusManagerState
  }), [portalNode]);
  return /* @__PURE__ */ u(S, {
    children: [portalSubtree, /* @__PURE__ */ u(PortalContext.Provider, {
      value: portalContextValue,
      children: [shouldRenderGuards && portalNode && /* @__PURE__ */ u(FocusGuard, {
        "data-type": "outside",
        ref: beforeOutsideRef,
        onFocus: (event) => {
          if (isOutsideEvent(event, portalNode)) {
            beforeInsideRef.current?.focus();
          } else {
            const domReference = focusManagerState ? focusManagerState.domReference : null;
            const prevTabbable = getPreviousTabbable(domReference);
            prevTabbable?.focus();
          }
        }
      }), shouldRenderGuards && portalNode && /* @__PURE__ */ u("span", {
        "aria-owns": portalNode.id,
        style: ownerVisuallyHidden
      }), portalNode && /* @__PURE__ */ $(children, portalNode), shouldRenderGuards && portalNode && /* @__PURE__ */ u(FocusGuard, {
        "data-type": "outside",
        ref: afterOutsideRef,
        onFocus: (event) => {
          if (isOutsideEvent(event, portalNode)) {
            afterInsideRef.current?.focus();
          } else {
            const domReference = focusManagerState ? focusManagerState.domReference : null;
            const nextTabbable = getNextTabbable(domReference);
            nextTabbable?.focus();
            if (focusManagerState?.closeOnFocusOut) {
              focusManagerState?.onOpenChange(false, createChangeEventDetails(focusOut, event.nativeEvent));
            }
          }
        }
      })]
    })]
  });
});
const FloatingTreeContext = /* @__PURE__ */ X$2(null);
const useFloatingTree = (externalTree) => {
  const contextTree = x$2(FloatingTreeContext);
  return externalTree ?? contextTree;
};
function resolveRef(maybeRef) {
  if (maybeRef == null) {
    return maybeRef;
  }
  return "current" in maybeRef ? maybeRef.current : maybeRef;
}
function getEventType(event, lastInteractionType) {
  const win = getWindow(getTarget(event));
  if (event instanceof win.KeyboardEvent) {
    return "keyboard";
  }
  if (event instanceof win.FocusEvent) {
    return lastInteractionType || "keyboard";
  }
  if ("pointerType" in event) {
    return event.pointerType || "keyboard";
  }
  if ("touches" in event) {
    return "touch";
  }
  if (event instanceof win.MouseEvent) {
    return lastInteractionType || (event.detail === 0 ? "keyboard" : "mouse");
  }
  return "";
}
const LIST_LIMIT = 20;
let previouslyFocusedElements = [];
function clearDisconnectedPreviouslyFocusedElements() {
  previouslyFocusedElements = previouslyFocusedElements.filter((entry) => {
    return entry.deref()?.isConnected;
  });
}
function addPreviouslyFocusedElement(element) {
  clearDisconnectedPreviouslyFocusedElements();
  if (element && getNodeName(element) !== "body") {
    previouslyFocusedElements.push(new WeakRef(element));
    if (previouslyFocusedElements.length > LIST_LIMIT) {
      previouslyFocusedElements = previouslyFocusedElements.slice(-LIST_LIMIT);
    }
  }
}
function getPreviouslyFocusedElement() {
  clearDisconnectedPreviouslyFocusedElements();
  return previouslyFocusedElements[previouslyFocusedElements.length - 1]?.deref();
}
function getFirstTabbableElement(container) {
  if (!container) {
    return null;
  }
  if (isTabbable(container)) {
    return container;
  }
  return tabbable(container)[0] || container;
}
function handleTabIndex(floatingFocusElement, orderRef) {
  if (floatingFocusElement.hasAttribute("tabindex") && !floatingFocusElement.hasAttribute("data-tabindex")) {
    return;
  }
  if (!orderRef.current.includes("floating") && !floatingFocusElement.getAttribute("role")?.includes("dialog")) {
    return;
  }
  const focusableElements = focusable(floatingFocusElement);
  const tabbableContent = focusableElements.filter((element) => {
    const dataTabIndex = element.getAttribute("data-tabindex") || "";
    return isTabbable(element) || element.hasAttribute("data-tabindex") && !dataTabIndex.startsWith("-");
  });
  const tabIndex = floatingFocusElement.getAttribute("tabindex");
  if (orderRef.current.includes("floating") || tabbableContent.length === 0) {
    if (tabIndex !== "0") {
      floatingFocusElement.setAttribute("tabindex", "0");
    }
  } else if (tabIndex !== "-1" || floatingFocusElement.hasAttribute("data-tabindex") && floatingFocusElement.getAttribute("data-tabindex") !== "-1") {
    floatingFocusElement.setAttribute("tabindex", "-1");
    floatingFocusElement.setAttribute("data-tabindex", "-1");
  }
}
function FloatingFocusManager(props) {
  const {
    context,
    children,
    disabled = false,
    initialFocus = true,
    returnFocus = true,
    restoreFocus = false,
    modal = true,
    closeOnFocusOut = true,
    openInteractionType = "",
    nextFocusableElement,
    previousFocusableElement,
    beforeContentFocusGuardRef,
    externalTree,
    getInsideElements
  } = props;
  const store = "rootStore" in context ? context.rootStore : context;
  const open = store.useState("open");
  const domReference = store.useState("domReferenceElement");
  const floating = store.useState("floatingElement");
  const {
    events,
    dataRef
  } = store.context;
  const getNodeId = useStableCallback(() => dataRef.current.floatingContext?.nodeId);
  const ignoreInitialFocus = initialFocus === false;
  const isUntrappedTypeableCombobox = isTypeableCombobox(domReference) && ignoreInitialFocus;
  const orderRef = A$2(["content"]);
  const initialFocusRef = useValueAsRef(initialFocus);
  const returnFocusRef = useValueAsRef(returnFocus);
  const openInteractionTypeRef = useValueAsRef(openInteractionType);
  const tree = useFloatingTree(externalTree);
  const portalContext = usePortalContext();
  const preventReturnFocusRef = A$2(false);
  const isPointerDownRef = A$2(false);
  const pointerDownOutsideRef = A$2(false);
  const lastFocusedTabbableRef = A$2(null);
  const closeTypeRef = A$2("");
  const lastInteractionTypeRef = A$2("");
  const beforeGuardRef = A$2(null);
  const afterGuardRef = A$2(null);
  const mergedBeforeGuardRef = useMergedRefs(beforeGuardRef, beforeContentFocusGuardRef, portalContext?.beforeInsideRef);
  const mergedAfterGuardRef = useMergedRefs(afterGuardRef, portalContext?.afterInsideRef);
  const blurTimeout = useTimeout();
  const pointerDownTimeout = useTimeout();
  const restoreFocusFrame = useAnimationFrame();
  const isInsidePortal = portalContext != null;
  const floatingFocusElement = getFloatingFocusElement(floating);
  const getTabbableContent = useStableCallback((container = floatingFocusElement) => {
    return container ? tabbable(container) : [];
  });
  const getResolvedInsideElements = useStableCallback(() => getInsideElements?.().filter((element) => element != null) ?? []);
  y$1(() => {
    if (disabled || !modal) {
      return void 0;
    }
    function onKeyDown(event) {
      if (event.key === "Tab") {
        if (contains(floatingFocusElement, activeElement(ownerDocument(floatingFocusElement))) && getTabbableContent().length === 0 && !isUntrappedTypeableCombobox) {
          stopEvent(event);
        }
      }
    }
    const doc = ownerDocument(floatingFocusElement);
    return addEventListener(doc, "keydown", onKeyDown);
  }, [disabled, domReference, floatingFocusElement, modal, orderRef, isUntrappedTypeableCombobox, getTabbableContent]);
  y$1(() => {
    if (disabled || !open) {
      return void 0;
    }
    const doc = ownerDocument(floatingFocusElement);
    function clearPointerDownOutside() {
      pointerDownOutsideRef.current = false;
    }
    function onPointerDown(event) {
      const target = getTarget(event);
      const insideElements = getResolvedInsideElements();
      const pointerTargetInside = contains(floating, target) || contains(domReference, target) || contains(portalContext?.portalNode, target) || insideElements.some((element) => element === target || contains(element, target));
      pointerDownOutsideRef.current = !pointerTargetInside;
      lastInteractionTypeRef.current = event.pointerType || "keyboard";
      if (target?.closest(`[${CLICK_TRIGGER_IDENTIFIER}]`)) {
        isPointerDownRef.current = true;
      }
    }
    function onKeyDown() {
      lastInteractionTypeRef.current = "keyboard";
    }
    return mergeCleanups(addEventListener(doc, "pointerdown", onPointerDown, true), addEventListener(doc, "pointerup", clearPointerDownOutside, true), addEventListener(doc, "pointercancel", clearPointerDownOutside, true), addEventListener(doc, "keydown", onKeyDown, true));
  }, [disabled, floating, domReference, floatingFocusElement, open, portalContext, getResolvedInsideElements]);
  y$1(() => {
    if (disabled || !closeOnFocusOut) {
      return void 0;
    }
    const doc = ownerDocument(floatingFocusElement);
    function handlePointerDown() {
      isPointerDownRef.current = true;
      pointerDownTimeout.start(0, () => {
        isPointerDownRef.current = false;
      });
    }
    function handleFocusIn(event) {
      const target = getTarget(event);
      if (isTabbable(target)) {
        lastFocusedTabbableRef.current = target;
      }
    }
    function handleFocusOutside(event) {
      const relatedTarget = event.relatedTarget;
      const currentTarget = event.currentTarget;
      const target = getTarget(event);
      queueMicrotask(() => {
        const nodeId = getNodeId();
        const triggers = store.context.triggerElements;
        const insideElements = getResolvedInsideElements();
        const isRelatedFocusGuard = relatedTarget?.hasAttribute(createAttribute("focus-guard")) && [beforeGuardRef.current, afterGuardRef.current, portalContext?.beforeInsideRef.current, portalContext?.afterInsideRef.current, portalContext?.beforeOutsideRef.current, portalContext?.afterOutsideRef.current, resolveRef(previousFocusableElement), resolveRef(nextFocusableElement)].includes(relatedTarget);
        const movedToUnrelatedNode = !(contains(domReference, relatedTarget) || contains(floating, relatedTarget) || contains(relatedTarget, floating) || contains(portalContext?.portalNode, relatedTarget) || insideElements.some((element) => element === relatedTarget || contains(element, relatedTarget)) || relatedTarget != null && triggers.hasElement(relatedTarget) || triggers.hasMatchingElement((trigger) => contains(trigger, relatedTarget)) || isRelatedFocusGuard || tree && (getNodeChildren(tree.nodesRef.current, nodeId).find((node) => contains(node.context?.elements.floating, relatedTarget) || contains(node.context?.elements.domReference, relatedTarget)) || getNodeAncestors(tree.nodesRef.current, nodeId).find((node) => [node.context?.elements.floating, getFloatingFocusElement(node.context?.elements.floating)].includes(relatedTarget) || node.context?.elements.domReference === relatedTarget)));
        if (currentTarget === domReference && floatingFocusElement) {
          handleTabIndex(floatingFocusElement, orderRef);
        }
        if (restoreFocus && currentTarget !== domReference && !isElementVisible(target) && activeElement(doc) === doc.body) {
          if (isHTMLElement(floatingFocusElement)) {
            floatingFocusElement.focus();
            if (restoreFocus === "popup") {
              restoreFocusFrame.request(() => {
                floatingFocusElement.focus();
              });
              return;
            }
          }
          const tabbableContent = getTabbableContent();
          const prevTabbable = lastFocusedTabbableRef.current;
          const nodeToFocus = (prevTabbable && tabbableContent.includes(prevTabbable) ? prevTabbable : null) || tabbableContent[tabbableContent.length - 1] || floatingFocusElement;
          if (isHTMLElement(nodeToFocus)) {
            nodeToFocus.focus();
          }
        }
        if (dataRef.current.insideReactTree) {
          dataRef.current.insideReactTree = false;
          return;
        }
        if ((isUntrappedTypeableCombobox ? true : !modal) && relatedTarget && movedToUnrelatedNode && !isPointerDownRef.current && // Fix React 18 Strict Mode returnFocus due to double rendering.
        // For an "untrapped" typeable combobox (input role=combobox with
        // initialFocus=false), re-opening the popup and tabbing out should still close it even
        // when the previously focused element (e.g. the next tabbable outside the popup) is
        // focused again. Otherwise, the popup remains open on the second Tab sequence:
        // click input -> Tab (closes) -> click input -> Tab.
        // Allow closing when `isUntrappedTypeableCombobox` regardless of the previously focused element.
        (isUntrappedTypeableCombobox || relatedTarget !== getPreviouslyFocusedElement())) {
          preventReturnFocusRef.current = true;
          store.setOpen(false, createChangeEventDetails(focusOut, event));
        }
      });
    }
    function markInsideReactTree() {
      if (pointerDownOutsideRef.current) {
        return;
      }
      dataRef.current.insideReactTree = true;
      blurTimeout.start(0, () => {
        dataRef.current.insideReactTree = false;
      });
    }
    const domReferenceElement = isHTMLElement(domReference) ? domReference : null;
    if (!floating && !domReferenceElement) {
      return void 0;
    }
    return mergeCleanups(domReferenceElement && addEventListener(domReferenceElement, "focusout", handleFocusOutside), domReferenceElement && addEventListener(domReferenceElement, "pointerdown", handlePointerDown), floating && addEventListener(floating, "focusin", handleFocusIn), floating && addEventListener(floating, "focusout", handleFocusOutside), floating && portalContext && addEventListener(floating, "focusout", markInsideReactTree, true));
  }, [disabled, domReference, floating, floatingFocusElement, modal, tree, portalContext, store, closeOnFocusOut, restoreFocus, getTabbableContent, isUntrappedTypeableCombobox, getNodeId, orderRef, dataRef, blurTimeout, pointerDownTimeout, restoreFocusFrame, nextFocusableElement, previousFocusableElement, getResolvedInsideElements]);
  y$1(() => {
    if (disabled || !floating || !open) {
      return void 0;
    }
    const portalNodes = Array.from(portalContext?.portalNode?.querySelectorAll(`[${createAttribute("portal")}]`) || []);
    const ancestors = tree ? getNodeAncestors(tree.nodesRef.current, getNodeId()) : [];
    const rootAncestorComboboxDomReference = ancestors.find((node) => isTypeableCombobox(node.context?.elements.domReference || null))?.context?.elements.domReference;
    const controlInsideElements = [floating, ...portalNodes, beforeGuardRef.current, afterGuardRef.current, portalContext?.beforeOutsideRef.current, portalContext?.afterOutsideRef.current, ...getResolvedInsideElements()];
    const insideElements = [...controlInsideElements, rootAncestorComboboxDomReference, resolveRef(previousFocusableElement), resolveRef(nextFocusableElement), isUntrappedTypeableCombobox ? domReference : null].filter((x2) => x2 != null);
    const ariaHiddenCleanup = markOthers(insideElements, {
      ariaHidden: modal || isUntrappedTypeableCombobox,
      mark: false
    });
    const markerInsideElements = [floating, ...portalNodes].filter((x2) => x2 != null);
    const markerCleanup = markOthers(markerInsideElements);
    return () => {
      markerCleanup();
      ariaHiddenCleanup();
    };
  }, [open, disabled, domReference, floating, modal, orderRef, portalContext, isUntrappedTypeableCombobox, tree, getNodeId, nextFocusableElement, previousFocusableElement, getResolvedInsideElements]);
  useIsoLayoutEffect(() => {
    if (!open || disabled || !isHTMLElement(floatingFocusElement)) {
      return;
    }
    const doc = ownerDocument(floatingFocusElement);
    const previouslyFocusedElement = activeElement(doc);
    queueMicrotask(() => {
      const initialFocusValueOrFn = initialFocusRef.current;
      const resolvedInitialFocus = typeof initialFocusValueOrFn === "function" ? initialFocusValueOrFn(openInteractionTypeRef.current || "") : initialFocusValueOrFn;
      if (resolvedInitialFocus === void 0 || resolvedInitialFocus === false) {
        return;
      }
      const focusAlreadyInsideFloatingEl = contains(floatingFocusElement, previouslyFocusedElement);
      if (focusAlreadyInsideFloatingEl) {
        return;
      }
      let focusableElements = null;
      const getDefaultFocusElement = () => {
        if (focusableElements == null) {
          focusableElements = getTabbableContent(floatingFocusElement);
        }
        return focusableElements[0] || floatingFocusElement;
      };
      let elToFocus;
      if (resolvedInitialFocus === true || resolvedInitialFocus === null) {
        elToFocus = getDefaultFocusElement();
      } else {
        elToFocus = resolveRef(resolvedInitialFocus);
      }
      elToFocus = elToFocus || getDefaultFocusElement();
      enqueueFocus(elToFocus, {
        preventScroll: elToFocus === floatingFocusElement
      });
    });
  }, [disabled, open, floatingFocusElement, ignoreInitialFocus, getTabbableContent, initialFocusRef, openInteractionTypeRef]);
  useIsoLayoutEffect(() => {
    if (disabled || !floatingFocusElement) {
      return void 0;
    }
    const doc = ownerDocument(floatingFocusElement);
    const previouslyFocusedElement = activeElement(doc);
    addPreviouslyFocusedElement(previouslyFocusedElement);
    function onOpenChangeLocal(details) {
      if (!details.open) {
        closeTypeRef.current = getEventType(details.nativeEvent, lastInteractionTypeRef.current);
      }
      if (details.reason === triggerHover && details.nativeEvent.type === "mouseleave") {
        preventReturnFocusRef.current = true;
      }
      if (details.reason !== outsidePress) {
        return;
      }
      if (details.nested) {
        preventReturnFocusRef.current = false;
      } else if (isVirtualClick(details.nativeEvent) || isVirtualPointerEvent(details.nativeEvent)) {
        preventReturnFocusRef.current = false;
      } else {
        let isPreventScrollSupported = false;
        ownerDocument(floatingFocusElement).createElement("div").focus({
          get preventScroll() {
            isPreventScrollSupported = true;
            return false;
          }
        });
        if (isPreventScrollSupported) {
          preventReturnFocusRef.current = false;
        } else {
          preventReturnFocusRef.current = true;
        }
      }
    }
    events.on("openchange", onOpenChangeLocal);
    function getReturnElement() {
      const returnFocusValueOrFn = returnFocusRef.current;
      let resolvedReturnFocusValue = typeof returnFocusValueOrFn === "function" ? returnFocusValueOrFn(closeTypeRef.current) : returnFocusValueOrFn;
      if (resolvedReturnFocusValue === void 0 || resolvedReturnFocusValue === false) {
        return null;
      }
      if (resolvedReturnFocusValue === null) {
        resolvedReturnFocusValue = true;
      }
      if (typeof resolvedReturnFocusValue === "boolean") {
        const el = domReference || getPreviouslyFocusedElement();
        return el && el.isConnected ? el : null;
      }
      const fallback = domReference || getPreviouslyFocusedElement();
      return resolveRef(resolvedReturnFocusValue) || fallback || null;
    }
    return () => {
      events.off("openchange", onOpenChangeLocal);
      const activeEl = activeElement(doc);
      const insideElements = getResolvedInsideElements();
      const isFocusInsideFloatingTree = contains(floating, activeEl) || insideElements.some((element) => element === activeEl || contains(element, activeEl)) || tree && getNodeChildren(tree.nodesRef.current, getNodeId(), false).some((node) => contains(node.context?.elements.floating, activeEl));
      const returnFocusValueOrFn = returnFocusRef.current;
      const returnElement = getReturnElement();
      queueMicrotask(() => {
        const tabbableReturnElement = getFirstTabbableElement(returnElement);
        const hasExplicitReturnFocus = typeof returnFocusValueOrFn !== "boolean";
        if (returnFocusValueOrFn && !preventReturnFocusRef.current && isHTMLElement(tabbableReturnElement) && // If the focus moved somewhere else after mount, avoid returning focus
        // since it likely entered a different element which should be
        // respected: https://github.com/floating-ui/floating-ui/issues/2607
        (!hasExplicitReturnFocus && tabbableReturnElement !== activeEl && activeEl !== doc.body ? isFocusInsideFloatingTree : true)) {
          tabbableReturnElement.focus({
            preventScroll: true
          });
        }
        preventReturnFocusRef.current = false;
      });
    };
  }, [disabled, floating, floatingFocusElement, returnFocusRef, dataRef, events, tree, domReference, getNodeId, getResolvedInsideElements]);
  useIsoLayoutEffect(() => {
    if (!isWebKit || open || !floating) {
      return;
    }
    const activeEl = activeElement(ownerDocument(floating));
    if (!isHTMLElement(activeEl) || !isTypeableElement(activeEl)) {
      return;
    }
    if (contains(floating, activeEl)) {
      activeEl.blur();
    }
  }, [open, floating]);
  useIsoLayoutEffect(() => {
    if (disabled || !portalContext) {
      return void 0;
    }
    portalContext.setFocusManagerState({
      modal,
      closeOnFocusOut,
      open,
      onOpenChange: store.setOpen,
      domReference
    });
    return () => {
      portalContext.setFocusManagerState(null);
    };
  }, [disabled, portalContext, modal, open, store, closeOnFocusOut, domReference]);
  useIsoLayoutEffect(() => {
    if (disabled || !floatingFocusElement) {
      return void 0;
    }
    handleTabIndex(floatingFocusElement, orderRef);
    return () => {
      queueMicrotask(clearDisconnectedPreviouslyFocusedElements);
    };
  }, [disabled, floatingFocusElement, orderRef]);
  const shouldRenderGuards = !disabled && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal);
  return /* @__PURE__ */ u(S, {
    children: [shouldRenderGuards && /* @__PURE__ */ u(FocusGuard, {
      "data-type": "inside",
      ref: mergedBeforeGuardRef,
      onFocus: (event) => {
        if (modal) {
          const els = getTabbableContent();
          enqueueFocus(els[els.length - 1]);
        } else if (portalContext?.portalNode) {
          preventReturnFocusRef.current = false;
          if (isOutsideEvent(event, portalContext.portalNode)) {
            const nextTabbable = getNextTabbable(domReference);
            nextTabbable?.focus();
          } else {
            resolveRef(previousFocusableElement ?? portalContext.beforeOutsideRef)?.focus();
          }
        }
      }
    }), children, shouldRenderGuards && /* @__PURE__ */ u(FocusGuard, {
      "data-type": "inside",
      ref: mergedAfterGuardRef,
      onFocus: (event) => {
        if (modal) {
          enqueueFocus(getTabbableContent()[0]);
        } else if (portalContext?.portalNode) {
          if (closeOnFocusOut) {
            preventReturnFocusRef.current = true;
          }
          if (isOutsideEvent(event, portalContext.portalNode)) {
            const prevTabbable = getPreviousTabbable(domReference);
            prevTabbable?.focus();
          } else {
            resolveRef(nextFocusableElement ?? portalContext.afterOutsideRef)?.focus();
          }
        }
      }
    })]
  });
}
const createSelector$1 = (a2, b2, c2, d2, e2, f2, ...other) => {
  if (other.length > 0) {
    throw new Error(formatErrorMessage(1));
  }
  let selector;
  if (a2) {
    selector = a2;
  } else {
    throw (
      /* minify-error-disabled */
      new Error("Missing arguments")
    );
  }
  return selector;
};
var NOT_FOUND = /* @__PURE__ */ Symbol("NOT_FOUND");
function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
  if (typeof func !== "function") {
    throw new TypeError(errorMessage);
  }
}
function assertIsObject(object, errorMessage = `expected an object, instead received ${typeof object}`) {
  if (typeof object !== "object") {
    throw new TypeError(errorMessage);
  }
}
function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
  if (!array.every((item) => typeof item === "function")) {
    const itemTypes = array.map((item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
    throw new TypeError(`${errorMessage}[${itemTypes}]`);
  }
}
var ensureIsArray = (item) => {
  return Array.isArray(item) ? item : [item];
};
function getDependencies(createSelectorArgs) {
  const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
  assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions, but received the following types: `);
  return dependencies;
}
function collectInputSelectorResults(dependencies, inputSelectorArgs) {
  const inputSelectorResults = [];
  const {
    length
  } = dependencies;
  for (let i2 = 0; i2 < length; i2++) {
    inputSelectorResults.push(dependencies[i2].apply(null, inputSelectorArgs));
  }
  return inputSelectorResults;
}
function createSingletonCache(equals) {
  let entry;
  return {
    get(key) {
      if (entry && equals(entry.key, key)) {
        return entry.value;
      }
      return NOT_FOUND;
    },
    put(key, value) {
      entry = {
        key,
        value
      };
    },
    getEntries() {
      return entry ? [entry] : [];
    },
    clear() {
      entry = void 0;
    }
  };
}
function createLruCache(maxSize, equals) {
  let entries = [];
  function get2(key) {
    const cacheIndex = entries.findIndex((entry) => equals(key, entry.key));
    if (cacheIndex > -1) {
      const entry = entries[cacheIndex];
      if (cacheIndex > 0) {
        entries.splice(cacheIndex, 1);
        entries.unshift(entry);
      }
      return entry.value;
    }
    return NOT_FOUND;
  }
  function put(key, value) {
    if (get2(key) === NOT_FOUND) {
      entries.unshift({
        key,
        value
      });
      if (entries.length > maxSize) {
        entries.pop();
      }
    }
  }
  function getEntries() {
    return entries;
  }
  function clear() {
    entries = [];
  }
  return {
    get: get2,
    put,
    getEntries,
    clear
  };
}
var referenceEqualityCheck = (a2, b2) => a2 === b2;
function createCacheKeyComparator(equalityCheck) {
  return function areArgumentsShallowlyEqual(prev, next) {
    if (prev === null || next === null || prev.length !== next.length) {
      return false;
    }
    const {
      length
    } = prev;
    for (let i2 = 0; i2 < length; i2++) {
      if (!equalityCheck(prev[i2], next[i2])) {
        return false;
      }
    }
    return true;
  };
}
function lruMemoize(func, equalityCheckOrOptions) {
  const providedOptions = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : {
    equalityCheck: equalityCheckOrOptions
  };
  const {
    equalityCheck = referenceEqualityCheck,
    maxSize = 1,
    resultEqualityCheck
  } = providedOptions;
  const comparator = createCacheKeyComparator(equalityCheck);
  let resultsCount = 0;
  const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);
  function memoized() {
    let value = cache.get(arguments);
    if (value === NOT_FOUND) {
      value = func.apply(null, arguments);
      resultsCount++;
      if (resultEqualityCheck) {
        const entries = cache.getEntries();
        const matchingEntry = entries.find((entry) => resultEqualityCheck(entry.value, value));
        if (matchingEntry) {
          value = matchingEntry.value;
          resultsCount !== 0 && resultsCount--;
        }
      }
      cache.put(arguments, value);
    }
    return value;
  }
  memoized.clearCache = () => {
    cache.clear();
    memoized.resetResultsCount();
  };
  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };
  return memoized;
}
var StrongRef = class {
  constructor(value) {
    this.value = value;
  }
  deref() {
    return this.value;
  }
};
var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;
var UNTERMINATED = 0;
var TERMINATED = 1;
function createCacheNode() {
  return {
    s: UNTERMINATED,
    v: void 0,
    o: null,
    p: null
  };
}
function weakMapMemoize(func, options2 = {}) {
  let fnNode = createCacheNode();
  const {
    resultEqualityCheck
  } = options2;
  let lastResult;
  let resultsCount = 0;
  function memoized() {
    let cacheNode = fnNode;
    const {
      length
    } = arguments;
    for (let i2 = 0, l2 = length; i2 < l2; i2++) {
      const arg = arguments[i2];
      if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
        let objectCache = cacheNode.o;
        if (objectCache === null) {
          cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
        }
        const objectNode = objectCache.get(arg);
        if (objectNode === void 0) {
          cacheNode = createCacheNode();
          objectCache.set(arg, cacheNode);
        } else {
          cacheNode = objectNode;
        }
      } else {
        let primitiveCache = cacheNode.p;
        if (primitiveCache === null) {
          cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
        }
        const primitiveNode = primitiveCache.get(arg);
        if (primitiveNode === void 0) {
          cacheNode = createCacheNode();
          primitiveCache.set(arg, cacheNode);
        } else {
          cacheNode = primitiveNode;
        }
      }
    }
    const terminatedNode = cacheNode;
    let result;
    if (cacheNode.s === TERMINATED) {
      result = cacheNode.v;
    } else {
      result = func.apply(null, arguments);
      resultsCount++;
      if (resultEqualityCheck) {
        const lastResultValue = lastResult?.deref?.() ?? lastResult;
        if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
          result = lastResultValue;
          resultsCount !== 0 && resultsCount--;
        }
        const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
        lastResult = needsWeakRef ? new Ref(result) : result;
      }
    }
    terminatedNode.s = TERMINATED;
    terminatedNode.v = result;
    return result;
  }
  memoized.clearCache = () => {
    fnNode = createCacheNode();
    memoized.resetResultsCount();
  };
  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };
  return memoized;
}
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
  const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
    memoize: memoizeOrOptions,
    memoizeOptions: memoizeOptionsFromArgs
  } : memoizeOrOptions;
  const createSelector2 = (...createSelectorArgs) => {
    let recomputations = 0;
    let dependencyRecomputations = 0;
    let lastResult;
    let directlyPassedOptions = {};
    let resultFunc = createSelectorArgs.pop();
    if (typeof resultFunc === "object") {
      directlyPassedOptions = resultFunc;
      resultFunc = createSelectorArgs.pop();
    }
    assertIsFunction(resultFunc, `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`);
    const combinedOptions = {
      ...createSelectorCreatorOptions,
      ...directlyPassedOptions
    };
    const {
      memoize: memoize2,
      memoizeOptions = [],
      argsMemoize = weakMapMemoize,
      argsMemoizeOptions = []
    } = combinedOptions;
    const finalMemoizeOptions = ensureIsArray(memoizeOptions);
    const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
    const dependencies = getDependencies(createSelectorArgs);
    const memoizedResultFunc = memoize2(function recomputationWrapper() {
      recomputations++;
      return resultFunc.apply(null, arguments);
    }, ...finalMemoizeOptions);
    const selector = argsMemoize(function dependenciesChecker() {
      dependencyRecomputations++;
      const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
      lastResult = memoizedResultFunc.apply(null, inputSelectorResults);
      return lastResult;
    }, ...finalArgsMemoizeOptions);
    return Object.assign(selector, {
      resultFunc,
      memoizedResultFunc,
      dependencies,
      dependencyRecomputations: () => dependencyRecomputations,
      resetDependencyRecomputations: () => {
        dependencyRecomputations = 0;
      },
      lastResult: () => lastResult,
      recomputations: () => recomputations,
      resetRecomputations: () => {
        recomputations = 0;
      },
      memoize: memoize2,
      argsMemoize
    });
  };
  Object.assign(createSelector2, {
    withTypes: () => createSelector2
  });
  return createSelector2;
}
var createSelector = /* @__PURE__ */ createSelectorCreator(weakMapMemoize);
var createStructuredSelector = Object.assign((inputSelectorsObject, selectorCreator = createSelector) => {
  assertIsObject(inputSelectorsObject, `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof inputSelectorsObject}`);
  const inputSelectorKeys = Object.keys(inputSelectorsObject);
  const dependencies = inputSelectorKeys.map((key) => inputSelectorsObject[key]);
  const structuredSelector = selectorCreator(dependencies, (...inputSelectorResults) => {
    return inputSelectorResults.reduce((composition, value, index) => {
      composition[inputSelectorKeys[index]] = value;
      return composition;
    }, {});
  });
  return structuredSelector;
}, {
  withTypes: () => createStructuredSelector
});
createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: {
    maxSize: 1,
    equalityCheck: Object.is
  }
});
var exports$4 = {};
Object.defineProperty(exports$4, "__esModule", {
  value: true
});
var React$1 = gn ?? _mod$5;
function is$1(x2, y2) {
  return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
}
var objectIs$1 = "function" === typeof Object.is ? Object.is : is$1, useState = React$1.useState, useEffect$1 = React$1.useEffect, useLayoutEffect = React$1.useLayoutEffect, useDebugValue$1 = React$1.useDebugValue;
function useSyncExternalStore$2(subscribe, getSnapshot) {
  var value = getSnapshot(), _useState = useState({
    inst: {
      value,
      getSnapshot
    }
  }), inst = _useState[0].inst, forceUpdate = _useState[1];
  useLayoutEffect(function() {
    inst.value = value;
    inst.getSnapshot = getSnapshot;
    checkIfSnapshotChanged(inst) && forceUpdate({
      inst
    });
  }, [subscribe, value, getSnapshot]);
  useEffect$1(function() {
    checkIfSnapshotChanged(inst) && forceUpdate({
      inst
    });
    return subscribe(function() {
      checkIfSnapshotChanged(inst) && forceUpdate({
        inst
      });
    });
  }, [subscribe]);
  useDebugValue$1(value);
  return value;
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs$1(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function useSyncExternalStore$1(subscribe, getSnapshot) {
  return getSnapshot();
}
var shim$1 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
exports$4.useSyncExternalStore = void 0 !== React$1.useSyncExternalStore ? React$1.useSyncExternalStore : shim$1;
var _useSyncExternalStore = exports$4.useSyncExternalStore;
var _default$2;
if (typeof exports$4 === "object" && exports$4 !== null && "default" in exports$4) {
  _default$2 = exports$4.default;
} else {
  _default$2 = exports$4;
}
const _default_default$2 = _default$2;
var __require$2 = exports$4;
const _mod$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$2,
  default: _default_default$2,
  useSyncExternalStore: _useSyncExternalStore
}, Symbol.toStringTag, { value: "Module" }));
var exports$3 = {}, module$2 = {};
Object.defineProperty(module$2, "exports", {
  get() {
    return exports$3;
  },
  set(value) {
    exports$3 = value;
  }
});
Object.defineProperty(exports$3, "__esModule", {
  value: true
});
module$2.exports = _mod$1;
var _default$1;
if (typeof exports$3 === "object" && exports$3 !== null && "default" in exports$3) {
  _default$1 = exports$3.default;
} else {
  _default$1 = exports$3;
}
const _default_default$1 = _default$1;
var __require$1 = exports$3;
const _mod2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$1,
  default: _default_default$1,
  useSyncExternalStore: _useSyncExternalStore
}, Symbol.toStringTag, { value: "Module" }));
var exports$2 = {};
Object.defineProperty(exports$2, "__esModule", {
  value: true
});
var React = gn ?? _mod$5, shim = __require$1 ?? _default_default$1 ?? _mod2;
function is(x2, y2) {
  return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
}
var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
exports$2.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual2) {
  var instRef = useRef(null);
  if (null === instRef.current) {
    var inst = {
      hasValue: false,
      value: null
    };
    instRef.current = inst;
  } else inst = instRef.current;
  instRef = useMemo(function() {
    function memoizedSelector(nextSnapshot) {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        nextSnapshot = selector(nextSnapshot);
        if (void 0 !== isEqual2 && inst.hasValue) {
          var currentSelection = inst.value;
          if (isEqual2(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
        }
        return memoizedSelection = nextSnapshot;
      }
      currentSelection = memoizedSelection;
      if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
      var nextSelection = selector(nextSnapshot);
      if (void 0 !== isEqual2 && isEqual2(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
      memoizedSnapshot = nextSnapshot;
      return memoizedSelection = nextSelection;
    }
    var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
    return [function() {
      return memoizedSelector(getSnapshot());
    }, null === maybeGetServerSnapshot ? void 0 : function() {
      return memoizedSelector(maybeGetServerSnapshot());
    }];
  }, [getSnapshot, getServerSnapshot, selector, isEqual2]);
  var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
  useEffect(function() {
    inst.hasValue = true;
    inst.value = value;
  }, [value]);
  useDebugValue(value);
  return value;
};
var _useSyncExternalStoreWithSelector = exports$2.useSyncExternalStoreWithSelector;
var _default;
if (typeof exports$2 === "object" && exports$2 !== null && "default" in exports$2) {
  _default = exports$2.default;
} else {
  _default = exports$2;
}
const _default_default = _default;
var __require = exports$2;
const _mod = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require,
  default: _default_default,
  useSyncExternalStoreWithSelector: _useSyncExternalStoreWithSelector
}, Symbol.toStringTag, { value: "Module" }));
var exports$1 = {}, module$1 = {};
Object.defineProperty(module$1, "exports", {
  get() {
    return exports$1;
  },
  set(value) {
    exports$1 = value;
  }
});
Object.defineProperty(exports$1, "__esModule", {
  value: true
});
module$1.exports = _mod;
if (typeof exports$1 === "object" && exports$1 !== null && "default" in exports$1) {
  exports$1.default;
}
({
  open: createSelector$1((state) => state.open),
  transitionStatus: createSelector$1((state) => state.transitionStatus),
  domReferenceElement: createSelector$1((state) => state.domReferenceElement),
  referenceElement: createSelector$1((state) => state.positionReference ?? state.referenceElement),
  floatingElement: createSelector$1((state) => state.floatingElement),
  floatingId: createSelector$1((state) => state.floatingId)
});
function useAnimationsFinished(elementOrRef, waitForStartingStyleRemoved = false, treatAbortedAsFinished = true) {
  const frame = useAnimationFrame();
  return useStableCallback((fnToExecute, signal = null) => {
    frame.cancel();
    const element = resolveRef(elementOrRef);
    if (element == null) {
      return;
    }
    const resolvedElement = element;
    const done = () => {
      bn(fnToExecute);
    };
    if (typeof resolvedElement.getAnimations !== "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
      fnToExecute();
      return;
    }
    function exec() {
      Promise.all(resolvedElement.getAnimations().map((animation) => animation.finished)).then(() => {
        if (!signal?.aborted) {
          done();
        }
      }).catch(() => {
        if (treatAbortedAsFinished) {
          if (!signal?.aborted) {
            done();
          }
          return;
        }
        const currentAnimations = resolvedElement.getAnimations();
        if (!signal?.aborted && currentAnimations.length > 0 && currentAnimations.some((animation) => animation.pending || animation.playState !== "finished")) {
          exec();
        }
      });
    }
    if (waitForStartingStyleRemoved) {
      const startingStyleAttribute = TransitionStatusDataAttributes.startingStyle;
      if (!resolvedElement.hasAttribute(startingStyleAttribute)) {
        frame.request(exec);
        return;
      }
      const attributeObserver = new MutationObserver(() => {
        if (!resolvedElement.hasAttribute(startingStyleAttribute)) {
          attributeObserver.disconnect();
          exec();
        }
      });
      attributeObserver.observe(resolvedElement, {
        attributes: true,
        attributeFilter: [startingStyleAttribute]
      });
      signal?.addEventListener("abort", () => attributeObserver.disconnect(), {
        once: true
      });
      return;
    }
    frame.request(exec);
  });
}
function useOpenChangeComplete(parameters) {
  const {
    enabled: enabled2 = true,
    open,
    ref,
    onComplete: onCompleteParam
  } = parameters;
  const onComplete = useStableCallback(onCompleteParam);
  const runOnceAnimationsFinish = useAnimationsFinished(ref, open, false);
  y$1(() => {
    if (!enabled2) {
      return void 0;
    }
    const abortController = new AbortController();
    runOnceAnimationsFinish(onComplete, abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [enabled2, open, onComplete, runOnceAnimationsFinish]);
}
const activeTriggerIdSelector = createSelector$1((state) => state.triggerIdProp ?? state.activeTriggerId);
({
  open: createSelector$1((state) => state.openProp ?? state.open),
  mounted: createSelector$1((state) => state.mounted),
  transitionStatus: createSelector$1((state) => state.transitionStatus),
  floatingRootContext: createSelector$1((state) => state.floatingRootContext),
  preventUnmountingOnClose: createSelector$1((state) => state.preventUnmountingOnClose),
  payload: createSelector$1((state) => state.payload),
  activeTriggerElement: createSelector$1((state) => state.mounted ? state.activeTriggerElement : null),
  /**
   * Whether the trigger with the given ID was used to open the popup.
   */
  isTriggerActive: createSelector$1((state, triggerId) => triggerId !== void 0 && activeTriggerIdSelector(state) === triggerId),
  /**
   * Whether the popup is open and was activated by a trigger with the given ID.
   */
  isOpenedByTrigger: createSelector$1((state, triggerId) => triggerId !== void 0 && activeTriggerIdSelector(state) === triggerId && state.open),
  /**
   * Whether the popup is mounted and was activated by a trigger with the given ID.
   */
  isMountedByTrigger: createSelector$1((state, triggerId) => triggerId !== void 0 && activeTriggerIdSelector(state) === triggerId && state.mounted),
  triggerProps: createSelector$1((state, isActive) => isActive ? state.activeTriggerProps : state.inactiveTriggerProps),
  popupProps: createSelector$1((state) => state.popupProps),
  popupElement: createSelector$1((state) => state.popupElement),
  positionerElement: createSelector$1((state) => state.positionerElement)
});
let DialogPopupCssVars = /* @__PURE__ */ (function(DialogPopupCssVars2) {
  DialogPopupCssVars2["nestedDialogs"] = "--nested-dialogs";
  return DialogPopupCssVars2;
})({});
let DialogPopupDataAttributes = (function(DialogPopupDataAttributes2) {
  DialogPopupDataAttributes2[DialogPopupDataAttributes2["open"] = CommonPopupDataAttributes.open] = "open";
  DialogPopupDataAttributes2[DialogPopupDataAttributes2["closed"] = CommonPopupDataAttributes.closed] = "closed";
  DialogPopupDataAttributes2[DialogPopupDataAttributes2["startingStyle"] = CommonPopupDataAttributes.startingStyle] = "startingStyle";
  DialogPopupDataAttributes2[DialogPopupDataAttributes2["endingStyle"] = CommonPopupDataAttributes.endingStyle] = "endingStyle";
  DialogPopupDataAttributes2["nested"] = "data-nested";
  DialogPopupDataAttributes2["nestedDialogOpen"] = "data-nested-dialog-open";
  return DialogPopupDataAttributes2;
})({});
const DialogPortalContext = /* @__PURE__ */ X$2(void 0);
function useDialogPortalContext() {
  const value = x$2(DialogPortalContext);
  if (value === void 0) {
    throw new Error(formatErrorMessage(26));
  }
  return value;
}
const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const HOME = "Home";
const END = "End";
const HORIZONTAL_KEYS = /* @__PURE__ */ new Set([ARROW_LEFT, ARROW_RIGHT]);
const VERTICAL_KEYS = /* @__PURE__ */ new Set([ARROW_UP, ARROW_DOWN]);
const ARROW_KEYS = /* @__PURE__ */ new Set([...HORIZONTAL_KEYS, ...VERTICAL_KEYS]);
/* @__PURE__ */ new Set([...ARROW_KEYS, HOME, END]);
const COMPOSITE_KEYS = /* @__PURE__ */ new Set([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END]);
const stateAttributesMapping = {
  ...popupStateMapping,
  ...transitionStatusMapping,
  nestedDialogOpen(value) {
    return value ? {
      [DialogPopupDataAttributes.nestedDialogOpen]: ""
    } : null;
  }
};
const DialogPopup = /* @__PURE__ */ D(function DialogPopup2(componentProps, forwardedRef) {
  const {
    className,
    finalFocus,
    initialFocus,
    render,
    style,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const descriptionElementId = store.useState("descriptionElementId");
  const disablePointerDismissal = store.useState("disablePointerDismissal");
  const floatingRootContext = store.useState("floatingRootContext");
  const rootPopupProps = store.useState("popupProps");
  const modal = store.useState("modal");
  const mounted = store.useState("mounted");
  const nested = store.useState("nested");
  const nestedOpenDialogCount = store.useState("nestedOpenDialogCount");
  const open = store.useState("open");
  const openMethod = store.useState("openMethod");
  const titleElementId = store.useState("titleElementId");
  const transitionStatus = store.useState("transitionStatus");
  const role = store.useState("role");
  useDialogPortalContext();
  useOpenChangeComplete({
    open,
    ref: store.context.popupRef,
    onComplete() {
      if (open) {
        store.context.onOpenChangeComplete?.(true);
      }
    }
  });
  function defaultInitialFocus(interactionType) {
    if (interactionType === "touch") {
      return store.context.popupRef.current;
    }
    return true;
  }
  const resolvedInitialFocus = initialFocus === void 0 ? defaultInitialFocus : initialFocus;
  const nestedDialogOpen = nestedOpenDialogCount > 0;
  const state = {
    open,
    nested,
    transitionStatus,
    nestedDialogOpen
  };
  const element = useRenderElement("div", componentProps, {
    state,
    props: [rootPopupProps, {
      "aria-labelledby": titleElementId ?? void 0,
      "aria-describedby": descriptionElementId ?? void 0,
      role,
      tabIndex: -1,
      hidden: !mounted,
      onKeyDown(event) {
        if (COMPOSITE_KEYS.has(event.key)) {
          event.stopPropagation();
        }
      },
      style: {
        [DialogPopupCssVars.nestedDialogs]: nestedOpenDialogCount
      }
    }, elementProps],
    ref: [forwardedRef, store.context.popupRef, store.useStateSetter("popupElement")],
    stateAttributesMapping
  });
  return /* @__PURE__ */ u(FloatingFocusManager, {
    context: floatingRootContext,
    openInteractionType: openMethod,
    disabled: !mounted,
    closeOnFocusOut: !disablePointerDismissal,
    initialFocus: resolvedInitialFocus,
    returnFocus: finalFocus,
    modal: modal !== false,
    restoreFocus: "popup",
    children: element
  });
});
function inertValue(value) {
  if (isReactVersionAtLeast(19)) {
    return value;
  }
  return value ? "true" : void 0;
}
const InternalBackdrop = /* @__PURE__ */ D(function InternalBackdrop2(props, ref) {
  const {
    cutout,
    ...otherProps
  } = props;
  let clipPath;
  if (cutout) {
    const rect = cutout.getBoundingClientRect();
    clipPath = `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`;
  }
  return /* @__PURE__ */ u("div", {
    ref,
    role: "presentation",
    "data-base-ui-inert": "",
    ...otherProps,
    style: {
      position: "fixed",
      inset: 0,
      userSelect: "none",
      WebkitUserSelect: "none",
      clipPath
    }
  });
});
const DialogPortal$1 = /* @__PURE__ */ D(function DialogPortal(props, forwardedRef) {
  const {
    keepMounted = false,
    ...portalProps
  } = props;
  const {
    store
  } = useDialogRootContext();
  const mounted = store.useState("mounted");
  const modal = store.useState("modal");
  const open = store.useState("open");
  const shouldRender = mounted || keepMounted;
  if (!shouldRender) {
    return null;
  }
  return /* @__PURE__ */ u(DialogPortalContext.Provider, {
    value: keepMounted,
    children: /* @__PURE__ */ u(FloatingPortal, {
      ref: forwardedRef,
      ...portalProps,
      children: [mounted && modal === true && /* @__PURE__ */ u(InternalBackdrop, {
        ref: store.context.internalBackdropRef,
        inert: inertValue(!open)
      }), props.children]
    })
  });
});
({
  modal: createSelector$1((state) => state.modal),
  nested: createSelector$1((state) => state.nested),
  nestedOpenDialogCount: createSelector$1((state) => state.nestedOpenDialogCount),
  nestedOpenDrawerCount: createSelector$1((state) => state.nestedOpenDrawerCount),
  disablePointerDismissal: createSelector$1((state) => state.disablePointerDismissal),
  openMethod: createSelector$1((state) => state.openMethod),
  descriptionElementId: createSelector$1((state) => state.descriptionElementId),
  titleElementId: createSelector$1((state) => state.titleElementId),
  viewportElement: createSelector$1((state) => state.viewportElement),
  role: createSelector$1((state) => state.role)
});
(function(DialogViewportDataAttributes) {
  DialogViewportDataAttributes[DialogViewportDataAttributes["open"] = CommonPopupDataAttributes.open] = "open";
  DialogViewportDataAttributes[DialogViewportDataAttributes["closed"] = CommonPopupDataAttributes.closed] = "closed";
  DialogViewportDataAttributes[DialogViewportDataAttributes["startingStyle"] = CommonPopupDataAttributes.startingStyle] = "startingStyle";
  DialogViewportDataAttributes[DialogViewportDataAttributes["endingStyle"] = CommonPopupDataAttributes.endingStyle] = "endingStyle";
  DialogViewportDataAttributes["nested"] = "data-nested";
  DialogViewportDataAttributes["nestedDialogOpen"] = "data-nested-dialog-open";
  return DialogViewportDataAttributes;
})({});
const DialogTitle$1 = /* @__PURE__ */ D(function DialogTitle(componentProps, forwardedRef) {
  const {
    render,
    className,
    style,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const id = useBaseUiId(idProp);
  store.useSyncedValueWithCleanup("titleElementId", id);
  return useRenderElement("h2", componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
});
const DialogPortal2 = DialogPortal$1;
const DialogContent = /* @__PURE__ */ D$3(({
  className,
  children,
  ...props
}, ref) => /* @__PURE__ */ u$5(DialogPortal2, {
  children: [/* @__PURE__ */ u$5(DialogBackdrop, {
    className: "dialog-backdrop",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      backgroundColor: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(2px)",
      WebkitBackdropFilter: "blur(2px)",
      transition: "opacity 200ms ease"
    }
  }), /* @__PURE__ */ u$5(DialogPopup, {
    ref,
    className: cn("dialog-popup grid w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-2xl sm:rounded-2xl", className),
    style: {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 50,
      transition: "opacity 200ms ease, transform 200ms ease"
    },
    ...props,
    children: [children, /* @__PURE__ */ u$5(DialogClose, {
      className: "absolute right-4 top-4 rounded-xl p-1 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 disabled:pointer-events-none",
      children: [/* @__PURE__ */ u$5(X, {
        className: "h-4 w-4"
      }), /* @__PURE__ */ u$5("span", {
        className: "sr-only",
        children: "Close"
      })]
    })]
  })]
}));
DialogContent.displayName = "DialogContent";
const DialogTitle2 = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5(DialogTitle$1, {
  ref,
  className: cn("text-lg font-semibold leading-none tracking-tight", className),
  ...props
}));
DialogTitle2.displayName = "DialogTitle";
const DialogDescription2 = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5(DialogDescription$1, {
  ref,
  className: cn("text-sm text-muted-foreground", className),
  ...props
}));
DialogDescription2.displayName = "DialogDescription";
const Input = /* @__PURE__ */ D$3(({
  className,
  type,
  ...props
}, ref) => {
  return /* @__PURE__ */ u$5("input", {
    type,
    className: cn("flex h-9 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50", className),
    ref,
    ...props
  });
});
Input.displayName = "Input";
const Card = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5("div", {
  ref,
  className: cn("rounded-xl border bg-card text-card-foreground shadow-sm", className),
  ...props
}));
Card.displayName = "Card";
const CardHeader = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5("div", {
  ref,
  className: cn("flex flex-col space-y-1.5 p-6", className),
  ...props
}));
CardHeader.displayName = "CardHeader";
const CardTitle = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5("h3", {
  ref,
  className: cn("text-2xl font-semibold leading-none tracking-tight", className),
  ...props
}));
CardTitle.displayName = "CardTitle";
const CardDescription = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5("p", {
  ref,
  className: cn("text-sm text-muted-foreground", className),
  ...props
}));
CardDescription.displayName = "CardDescription";
const CardContent = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5("div", {
  ref,
  className: cn("p-6 pt-0", className),
  ...props
}));
CardContent.displayName = "CardContent";
const CardFooter = /* @__PURE__ */ D$3(({
  className,
  ...props
}, ref) => /* @__PURE__ */ u$5("div", {
  ref,
  className: cn("flex items-center p-6 pt-0", className),
  ...props
}));
CardFooter.displayName = "CardFooter";
function createField(baseType, extra) {
  return (opts) => {
    const {
      name,
      label,
      ...rest
    } = opts;
    const base = {
      name,
      label,
      type: baseType
    };
    if (extra) {
      Object.assign(base, extra(opts));
    }
    for (const [key, value] of Object.entries(rest)) {
      if (value !== void 0 && !(key in base)) {
        base[key] = value;
      }
    }
    return base;
  };
}
const textField = createField("text");
const textareaField = createField("textarea");
const selectField = createField("select", (opts) => ({
  options: opts.options
}));
const urlField = createField("url");
const CONTAINER_GROUPS = ["spacing", "sizing", "layout", "background", "border", "effects"];
const TEXT_GROUPS = ["spacing", "sizing", "typography", "background", "border", "effects"];
const MEDIA_GROUPS = ["spacing", "sizing", "effects"];
const ACTION_GROUPS = ["spacing", "sizing", "typography", "background", "border", "effects"];
const UTILITY_GROUPS = ["spacing", "sizing"];
function defineContainer(config2) {
  return {
    category: "layout",
    isContainer: true,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: CONTAINER_GROUPS,
    ...config2
  };
}
function defineText(config2) {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: TEXT_GROUPS,
    ...config2
  };
}
function defineMedia(config2) {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: MEDIA_GROUPS,
    ...config2
  };
}
function defineAction(config2) {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: ACTION_GROUPS,
    ...config2
  };
}
function defineUtility(config2) {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: UTILITY_GROUPS,
    ...config2
  };
}
function defineElement(config2) {
  return config2;
}
function defineStyleGroup(config2) {
  return config2;
}
function styleField(opts) {
  return {
    type: "select",
    ...opts
  };
}
defineContainer({
  type: "section",
  label: "Section",
  icon: LayoutDashboard,
  defaultStyles: {
    width: "full",
    padding: "20",
    paddingX: "6"
  }
});
defineContainer({
  type: "row",
  label: "Row",
  icon: Rows3,
  defaultStyles: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6"
  }
});
defineContainer({
  type: "column",
  label: "Column",
  icon: Columns3,
  defaultStyles: {
    display: "flex",
    flexDirection: "col",
    gap: "2"
  }
});
defineContainer({
  type: "grid",
  label: "Grid",
  icon: Grid3x3,
  defaultStyles: {
    display: "grid",
    gap: "6",
    gridTemplateColumns: "2"
  },
  fields: [selectField({
    name: "columns",
    label: "Columns",
    options: ["1", "2", "3", "4"]
  })]
});
defineText({
  type: "heading",
  label: "Heading",
  icon: Heading,
  defaultStyles: {
    fontSize: "5xl",
    fontWeight: "bold",
    lineHeight: "tight",
    color: "#0a0a0a"
  },
  defaultData: {
    content: "Heading",
    tagName: "h2"
  },
  fields: [selectField({
    name: "tagName",
    label: "Tag",
    options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"]
  }), textareaField({
    name: "content",
    label: "Text",
    rows: 3
  })]
});
defineText({
  type: "text",
  label: "Text",
  icon: Type,
  defaultStyles: {
    fontSize: "base",
    lineHeight: "relaxed",
    color: "#374151"
  },
  defaultData: {
    content: "Write your text here."
  },
  fields: [textareaField({
    name: "content",
    label: "Text",
    rows: 3
  })]
});
defineMedia({
  type: "image",
  label: "Image",
  icon: Image$1,
  defaultStyles: {
    maxWidth: "full",
    objectFit: "cover"
  },
  defaultData: {
    src: "https://placehold.co/800x400/e5e5e5/999?text=Image",
    alt: "Image"
  },
  fields: [urlField({
    name: "src",
    label: "Image URL"
  }), textField({
    name: "alt",
    label: "Alt text"
  })]
});
defineAction({
  type: "button",
  label: "Button",
  icon: Square,
  defaultStyles: {
    padding: "3",
    paddingX: "8",
    fontSize: "base",
    fontWeight: "semibold",
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    borderRadius: "lg"
  },
  defaultData: {
    content: "Click me",
    href: "#"
  },
  fields: [textField({
    name: "content",
    label: "Text"
  }), urlField({
    name: "href",
    label: "Link URL"
  })]
});
defineAction({
  type: "link",
  label: "Link",
  icon: Link,
  defaultStyles: {
    fontSize: "base",
    color: "#2563eb"
  },
  defaultData: {
    content: "Link text",
    href: "#"
  },
  fields: [textField({
    name: "content",
    label: "Text"
  }), urlField({
    name: "href",
    label: "Link URL"
  })]
});
defineUtility({
  type: "divider",
  label: "Divider",
  icon: Minus,
  defaultStyles: {
    marginY: "6"
  }
});
defineUtility({
  type: "spacer",
  label: "Spacer",
  icon: MoveVertical,
  defaultStyles: {
    height: "10"
  }
});
defineMedia({
  type: "video",
  label: "Video",
  icon: Play,
  defaultStyles: {
    maxWidth: "full"
  },
  defaultData: {
    src: ""
  },
  fields: [urlField({
    name: "src",
    label: "Video URL"
  })]
});
defineElement({
  type: "html",
  label: "HTML",
  icon: Code,
  category: "advanced",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    content: "<p>Custom HTML</p>"
  },
  fields: [textareaField({
    name: "content",
    label: "HTML",
    rows: 5
  })]
});
defineElement({
  type: "nav-bar",
  label: "Navigation Bar",
  icon: PanelTop,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    brandName: "Hi Editor",
    link1Text: "Features",
    link1Href: "#features",
    link2Text: "Docs",
    link2Href: "/docs",
    ctaText: "Get Started",
    ctaHref: "#"
  },
  fields: [textField({
    name: "brandName",
    label: "Brand Name"
  }), textField({
    name: "link1Text",
    label: "Link 1 Text"
  }), urlField({
    name: "link1Href",
    label: "Link 1 URL"
  }), textField({
    name: "link2Text",
    label: "Link 2 Text"
  }), urlField({
    name: "link2Href",
    label: "Link 2 URL"
  }), textField({
    name: "link3Text",
    label: "Link 3 Text"
  }), urlField({
    name: "link3Href",
    label: "Link 3 URL"
  }), textField({
    name: "ctaText",
    label: "CTA Text"
  }), urlField({
    name: "ctaHref",
    label: "CTA URL"
  })],
  styleGroups: ["background"]
});
defineElement({
  type: "hero-section",
  label: "Hero Section",
  icon: Sparkles,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Build pages\nvisually.",
    subheadline: "The self-hosted visual website builder. Design with atomic elements, store in PostgreSQL, render anywhere.",
    badge: "Open source visual builder",
    ctaText: "Get Started",
    ctaHref: "#",
    secondaryCtaText: "View Docs",
    secondaryCtaHref: "/docs"
  },
  fields: [textField({
    name: "badge",
    label: "Badge"
  }), textareaField({
    name: "headline",
    label: "Headline",
    rows: 3
  }), textareaField({
    name: "subheadline",
    label: "Subheadline",
    rows: 3
  }), textField({
    name: "ctaText",
    label: "Primary CTA Text"
  }), urlField({
    name: "ctaHref",
    label: "Primary CTA URL"
  }), textField({
    name: "secondaryCtaText",
    label: "Secondary CTA Text"
  }), urlField({
    name: "secondaryCtaHref",
    label: "Secondary CTA URL"
  })],
  styleGroups: ["background"]
});
defineElement({
  type: "features-section",
  label: "Features Section",
  icon: LayoutGrid,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Why Hi Editor?",
    subtitle: "Everything you need to build beautiful websites, without the complexity.",
    features: [{
      title: "Visual Editor",
      description: "Build pages with atomic elements — headings, text, images, buttons, and more. No code required."
    }, {
      title: "Self-hosted",
      description: "PostgreSQL + JSONB storage. No vendor lock-in, no third-party CMS. Your data stays on your server."
    }, {
      title: "Open Source",
      description: "Free, open source, and fully extensible. Create custom element types with zero configuration."
    }]
  },
  fields: [textField({
    name: "headline",
    label: "Section Headline"
  }), textField({
    name: "subtitle",
    label: "Subtitle"
  }), textareaField({
    name: "features",
    label: "Features JSON",
    rows: 6
  })],
  styleGroups: ["spacing", "background"]
});
defineElement({
  type: "showcase-section",
  label: "Showcase Section",
  icon: Monitor,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Design with precision",
    description: "A powerful visual editor that gives you full control over every element on your page. From typography to layout, every detail is editable.",
    ctaText: "Try it now",
    ctaHref: "/editor",
    imageSrc: "https://placehold.co/800x500/F5F0EB/9B8E82?text=Hi+Editor+Screenshot",
    imageAlt: "Hi Editor Interface",
    variant: "image-right"
  },
  fields: [textField({
    name: "headline",
    label: "Headline"
  }), textareaField({
    name: "description",
    label: "Description",
    rows: 3
  }), textField({
    name: "ctaText",
    label: "CTA Text"
  }), urlField({
    name: "ctaHref",
    label: "CTA URL"
  }), urlField({
    name: "imageSrc",
    label: "Image URL"
  }), textField({
    name: "imageAlt",
    label: "Image Alt Text"
  }), selectField({
    name: "variant",
    label: "Layout",
    options: ["image-right", "image-left"]
  })],
  styleGroups: ["spacing", "background"]
});
defineElement({
  type: "cta-section",
  label: "CTA Section",
  icon: MousePointerClick,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Ready to build?",
    description: "Start creating beautiful pages with Hi Editor today. Free and open source.",
    ctaText: "Get Started",
    ctaHref: "#"
  },
  fields: [textField({
    name: "headline",
    label: "Headline"
  }), textareaField({
    name: "description",
    label: "Description",
    rows: 2
  }), textField({
    name: "ctaText",
    label: "CTA Text"
  }), urlField({
    name: "ctaHref",
    label: "CTA URL"
  })],
  styleGroups: ["spacing"]
});
defineElement({
  type: "footer-section",
  label: "Footer Section",
  icon: PanelBottom,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    brandName: "Hi Editor",
    description: "The self-hosted visual website builder.",
    copyrightText: "© 2026 Hi Editor. Open source under MIT.",
    link1Text: "GitHub",
    link1Href: "https://github.com",
    link2Text: "Docs",
    link2Href: "/docs",
    link3Text: "Twitter",
    link3Href: "https://twitter.com"
  },
  fields: [textField({
    name: "brandName",
    label: "Brand Name"
  }), textField({
    name: "description",
    label: "Description"
  }), textField({
    name: "copyrightText",
    label: "Copyright"
  }), textField({
    name: "link1Text",
    label: "Link 1 Text"
  }), urlField({
    name: "link1Href",
    label: "Link 1 URL"
  }), textField({
    name: "link2Text",
    label: "Link 2 Text"
  }), urlField({
    name: "link2Href",
    label: "Link 2 URL"
  }), textField({
    name: "link3Text",
    label: "Link 3 Text"
  }), urlField({
    name: "link3Href",
    label: "Link 3 URL"
  }), textField({
    name: "link4Text",
    label: "Link 4 Text"
  }), urlField({
    name: "link4Href",
    label: "Link 4 URL"
  })],
  styleGroups: ["spacing"]
});
const SPACING = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32", "40", "48", "56", "64", "auto"];
const WIDTH = ["0", "auto", "full", "screen", "1/2", "1/3", "2/3", "1/4", "3/4", "1/5", "2/5", "3/5", "4/5", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "96"];
const HEIGHT = ["0", "auto", "full", "screen", "1/2", "1/3", "2/3", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "96"];
const MAX_WIDTH = ["0", "none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "full", "prose", "screen"];
const MIN_HEIGHT = ["0", "auto", "full", "screen", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "96"];
const FONT_SIZE = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"];
const FONT_WEIGHT = ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"];
const FONT_FAMILY = ["sans", "serif", "mono"];
const LINE_HEIGHT = ["none", "tight", "snug", "normal", "relaxed", "loose"];
const LETTER_SPACING = ["tighter", "tight", "normal", "wide", "wider", "widest"];
const TEXT_ALIGN = ["left", "center", "right", "justify"];
const DISPLAY = ["block", "inline-block", "inline", "flex", "inline-flex", "grid", "inline-grid", "hidden"];
const FLEX_DIRECTION = ["row", "row-reverse", "col", "col-reverse"];
const JUSTIFY_CONTENT = ["start", "end", "center", "between", "around", "evenly"];
const ALIGN_ITEMS = ["start", "end", "center", "stretch", "baseline"];
const FLEX_WRAP = ["wrap", "nowrap", "reverse"];
const BORDER_RADIUS = ["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"];
const BORDER_WIDTH = ["0", "1", "2", "4", "8"];
const BORDER_STYLE = ["solid", "dashed", "dotted", "double", "none"];
const OPACITY = ["0", "5", "10", "20", "25", "30", "40", "50", "60", "70", "75", "80", "90", "95", "100"];
const OVERFLOW = ["auto", "hidden", "visible", "scroll"];
const BACKGROUND_SIZE = ["auto", "cover", "contain"];
const BACKGROUND_POSITION = ["center", "top", "bottom", "left", "right", "left-top", "left-bottom", "right-top", "right-bottom"];
const GAP = SPACING;
const GRID_COLUMNS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
defineStyleGroup({
  label: "Spacing",
  fields: [styleField({
    name: "padding",
    label: "Padding",
    options: SPACING
  }), styleField({
    name: "paddingX",
    label: "Padding X",
    options: SPACING
  }), styleField({
    name: "paddingY",
    label: "Padding Y",
    options: SPACING
  }), styleField({
    name: "margin",
    label: "Margin",
    options: SPACING
  }), styleField({
    name: "marginX",
    label: "Margin X",
    options: SPACING
  }), styleField({
    name: "marginY",
    label: "Margin Y",
    options: SPACING
  })]
});
defineStyleGroup({
  label: "Size",
  fields: [styleField({
    name: "width",
    label: "Width",
    options: WIDTH
  }), styleField({
    name: "height",
    label: "Height",
    options: HEIGHT
  }), styleField({
    name: "minHeight",
    label: "Min Height",
    options: MIN_HEIGHT
  }), styleField({
    name: "maxWidth",
    label: "Max Width",
    options: MAX_WIDTH
  })]
});
defineStyleGroup({
  label: "Typography",
  fields: [styleField({
    name: "fontSize",
    label: "Font Size",
    options: FONT_SIZE
  }), styleField({
    name: "fontWeight",
    label: "Font Weight",
    options: FONT_WEIGHT
  }), styleField({
    name: "fontFamily",
    label: "Font Family",
    options: FONT_FAMILY
  }), styleField({
    name: "lineHeight",
    label: "Line Height",
    options: LINE_HEIGHT
  }), styleField({
    name: "letterSpacing",
    label: "Letter Spacing",
    options: LETTER_SPACING
  }), styleField({
    name: "textAlign",
    label: "Text Align",
    options: TEXT_ALIGN
  }), styleField({
    name: "color",
    label: "Color",
    type: "color"
  })]
});
defineStyleGroup({
  label: "Background",
  fields: [styleField({
    name: "backgroundColor",
    label: "Background Color",
    type: "color"
  }), styleField({
    name: "backgroundImage",
    label: "Background Image",
    type: "text",
    placeholder: "url(...)"
  }), styleField({
    name: "backgroundSize",
    label: "Background Size",
    options: BACKGROUND_SIZE
  }), styleField({
    name: "backgroundPosition",
    label: "Background Position",
    options: BACKGROUND_POSITION
  })]
});
defineStyleGroup({
  label: "Layout",
  fields: [styleField({
    name: "display",
    label: "Display",
    options: DISPLAY
  }), styleField({
    name: "flexDirection",
    label: "Flex Direction",
    options: FLEX_DIRECTION
  }), styleField({
    name: "flexWrap",
    label: "Flex Wrap",
    options: FLEX_WRAP
  }), styleField({
    name: "justifyContent",
    label: "Justify Content",
    options: JUSTIFY_CONTENT
  }), styleField({
    name: "alignItems",
    label: "Align Items",
    options: ALIGN_ITEMS
  }), styleField({
    name: "gap",
    label: "Gap",
    options: GAP
  }), styleField({
    name: "gridTemplateColumns",
    label: "Grid Columns",
    options: GRID_COLUMNS
  })]
});
defineStyleGroup({
  label: "Border",
  fields: [styleField({
    name: "borderRadius",
    label: "Border Radius",
    options: BORDER_RADIUS
  }), styleField({
    name: "borderWidth",
    label: "Border Width",
    options: BORDER_WIDTH
  }), styleField({
    name: "borderColor",
    label: "Border Color",
    type: "color"
  }), styleField({
    name: "borderStyle",
    label: "Border Style",
    options: BORDER_STYLE
  })]
});
defineStyleGroup({
  label: "Effects",
  fields: [styleField({
    name: "opacity",
    label: "Opacity",
    options: OPACITY
  }), styleField({
    name: "overflow",
    label: "Overflow",
    options: OVERFLOW
  })]
});
const cssCache = /* @__PURE__ */ new Map();
const THEME_PATH = new URL("../theme.css", import.meta.url).pathname;
async function runTailwind(inputPath) {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "npm:@tailwindcss/cli", "--input", inputPath],
    stdout: "piped",
    stderr: "piped"
  });
  const output = await cmd.output();
  return new TextDecoder().decode(output.stdout);
}
async function generateCSS(classes, genPath) {
  const key = classes.join(" ");
  const cached = cssCache.get(key);
  if (cached) return cached;
  const source = `@import "tailwindcss";
@import "${THEME_PATH}";
@source inline("${classes.join(" ")}");`;
  await Deno.writeTextFile(genPath, source);
  const css2 = await runTailwind(genPath);
  cssCache.set(key, css2);
  return css2;
}
const CLASS_REGEX = /class="([^"]+)"/g;
function extractClasses(html2) {
  const classes = /* @__PURE__ */ new Set();
  let match;
  while ((match = CLASS_REGEX.exec(html2)) !== null) {
    for (const c2 of match[1].split(/\s+/)) {
      if (c2) classes.add(c2);
    }
  }
  return [...classes].sort();
}
function tailwindHtmlMiddleware(genPath = "_tw_gen.css") {
  return async (_ctx, next) => {
    const response = await next();
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return response;
    const html2 = await response.text();
    const classes = extractClasses(html2);
    if (classes.length === 0) {
      return new Response(html2, {
        headers: response.headers,
        status: response.status
      });
    }
    const css2 = await generateCSS(classes, genPath);
    const injected = html2.replace("</head>", `<style>${css2}</style>`);
    return new Response(injected, {
      headers: response.headers,
      status: response.status
    });
  };
}
const mw = tailwindHtmlMiddleware();
const _middleware = define.middleware(async (ctx) => {
  return mw(ctx, () => ctx.next());
});
const routeCss = ["__FRESH_CSS_PLACEHOLDER__"];
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute____middleware = _middleware;
const fsRoute_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  config,
  css,
  default: _freshRoute____middleware,
  handler,
  handlers
}, Symbol.toStringTag, { value: "Module" }));
const clientEntry = "./assets/client-entry-DYIZI253.js";
const version = "ff36ae9ee3d10da2ca4643df88ff59ca8b811185";
const islands = /* @__PURE__ */ new Map();
const staticFiles = /* @__PURE__ */ new Map([
  ["/assets/fraunces-latin-400-normal-NUPT2cO8.woff", { "name": "/assets/fraunces-latin-400-normal-NUPT2cO8.woff", "hash": "695442434f77c44190b48a022f943e052bb60d49ed3c7940ea60a16ac3faf8b3", "filePath": "client/assets/fraunces-latin-400-normal-NUPT2cO8.woff", "contentType": "font/woff", "immutable": true }],
  ["/assets/fraunces-latin-400-normal-6IfK1voy.woff2", { "name": "/assets/fraunces-latin-400-normal-6IfK1voy.woff2", "hash": "e558f39453a9c611908be04294b50dea5f21ae6c49b41c6e47f4115e91f90209", "filePath": "client/assets/fraunces-latin-400-normal-6IfK1voy.woff2", "contentType": "font/woff2", "immutable": true }],
  ["/assets/fraunces-latin-ext-400-normal-UihxqfOe.woff", { "name": "/assets/fraunces-latin-ext-400-normal-UihxqfOe.woff", "hash": "6ea9935870863c9f04a8731afadcd1960ea3143a9ab5221f780ce7755822891a", "filePath": "client/assets/fraunces-latin-ext-400-normal-UihxqfOe.woff", "contentType": "font/woff", "immutable": true }],
  ["/assets/fraunces-latin-ext-400-normal-D8gbi3Gu.woff2", { "name": "/assets/fraunces-latin-ext-400-normal-D8gbi3Gu.woff2", "hash": "06e8dc8c2543a472414c40b585f0e87abf09e1e6ec7e17daec215e234822a76c", "filePath": "client/assets/fraunces-latin-ext-400-normal-D8gbi3Gu.woff2", "contentType": "font/woff2", "immutable": true }],
  ["/assets/fraunces-vietnamese-400-normal-B65MOf9T.woff", { "name": "/assets/fraunces-vietnamese-400-normal-B65MOf9T.woff", "hash": "be746fdc0922b2b6edac2262916163e487b72da918827d43ba5ebe72b77f56aa", "filePath": "client/assets/fraunces-vietnamese-400-normal-B65MOf9T.woff", "contentType": "font/woff", "immutable": true }],
  ["/assets/fraunces-vietnamese-400-normal-CvGt0Ybw.woff2", { "name": "/assets/fraunces-vietnamese-400-normal-CvGt0Ybw.woff2", "hash": "333c800d6e9eb9d08285b99f56029eb2e779176331ada8fe4b5ded32d73785cc", "filePath": "client/assets/fraunces-vietnamese-400-normal-CvGt0Ybw.woff2", "contentType": "font/woff2", "immutable": true }],
  ["/assets/recursive-latin-400-normal-BDSLYsZT.woff", { "name": "/assets/recursive-latin-400-normal-BDSLYsZT.woff", "hash": "2361a954fc459517fa4cea8291f1ffb7a5a35298765268a62a37b83b46c61e51", "filePath": "client/assets/recursive-latin-400-normal-BDSLYsZT.woff", "contentType": "font/woff", "immutable": true }],
  ["/assets/recursive-latin-400-normal-mQQmALBW.woff2", { "name": "/assets/recursive-latin-400-normal-mQQmALBW.woff2", "hash": "2257849c7e80510651180a24fbbcbee65c0e5cca16f5dd8709657fce131074b0", "filePath": "client/assets/recursive-latin-400-normal-mQQmALBW.woff2", "contentType": "font/woff2", "immutable": true }],
  ["/assets/recursive-latin-ext-400-normal-Buk17viZ.woff", { "name": "/assets/recursive-latin-ext-400-normal-Buk17viZ.woff", "hash": "aac8665de521c6ffaa910621aef3572721b2faad1afe8c4dcef7c693ddbc7862", "filePath": "client/assets/recursive-latin-ext-400-normal-Buk17viZ.woff", "contentType": "font/woff", "immutable": true }],
  ["/assets/recursive-latin-ext-400-normal-BANRm9Vy.woff2", { "name": "/assets/recursive-latin-ext-400-normal-BANRm9Vy.woff2", "hash": "a904286bbccbbd947ae9a9042f3d329962deb71dc006dcc2b0b83b594fde7e56", "filePath": "client/assets/recursive-latin-ext-400-normal-BANRm9Vy.woff2", "contentType": "font/woff2", "immutable": true }],
  ["/assets/recursive-vietnamese-400-normal-Cpd2iHHU.woff", { "name": "/assets/recursive-vietnamese-400-normal-Cpd2iHHU.woff", "hash": "e5d8fdd7374961e071daae9c598abe0e646ee93a59c07b5ffba8080c5f691db0", "filePath": "client/assets/recursive-vietnamese-400-normal-Cpd2iHHU.woff", "contentType": "font/woff", "immutable": true }],
  ["/assets/recursive-vietnamese-400-normal-D7FuKHmj.woff2", { "name": "/assets/recursive-vietnamese-400-normal-D7FuKHmj.woff2", "hash": "7158c8944b30ea2d985189b263092e87571f439a9242cc225ca3cfc0de06cc70", "filePath": "client/assets/recursive-vietnamese-400-normal-D7FuKHmj.woff2", "contentType": "font/woff2", "immutable": true }],
  ["/assets/client-entry-DYIZI253.js", { "name": "/assets/client-entry-DYIZI253.js", "hash": "a75dc5856cc95e9e5952c4a4dd607e2088ea530c66289eeec6ffa21aa8f6aa69", "filePath": "client/assets/client-entry-DYIZI253.js", "contentType": "text/javascript; charset=UTF-8", "immutable": true }],
  ["/assets/client-entry-kE2C1Cdi.css", { "name": "/assets/client-entry-kE2C1Cdi.css", "hash": "3814de6281896fefd14338571537d1529efdc8d9e04e9087263deb805ad8fc45", "filePath": "client/assets/client-entry-kE2C1Cdi.css", "contentType": "text/css; charset=UTF-8", "immutable": true }]
]);
const entryAssets = ["/assets/client-entry-kE2C1Cdi.css"];
const fsRoutes = [
  { id: "/_app", mod: fsRoute_0, type: "app", pattern: "*", routePattern: "*" },
  { id: "/_middleware", mod: fsRoute_1, type: "middleware", pattern: "/", routePattern: "/" },
  { id: "/[[slug]]", mod: () => import("./assets/_fresh-route___slug_-P8RMCPJG.mjs"), type: "route", pattern: "/{:slug}?", routePattern: "/{:slug}?" }
];
const snapshot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientEntry,
  entryAssets,
  fsRoutes,
  islands,
  staticFiles,
  version
}, Symbol.toStringTag, { value: "Module" }));
const app = new App();
app.use(staticFiles$1());
app.fsRoutes();
const root = join(import.meta.dirname, "..");
setBuildCache(app, new ProdBuildCache(root, snapshot), "production");
const _fresh_server_entry = {
  fetch: app.handler()
};
function registerStaticFile(prepared) {
  staticFiles.set(prepared.name, {
    name: prepared.name,
    contentType: prepared.contentType,
    filePath: prepared.filePath,
    hash: prepared.hash ?? null,
    immutable: prepared.immutable
  });
}
export {
  S$1 as S,
  a$4 as a,
  define as d,
  _fresh_server_entry as default,
  gn$1 as g,
  page as p,
  registerStaticFile,
  s$4 as s,
  u$5 as u
};
