"""
Generates frontend/lib/api/types.ts from openapi.json
"""
import json
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]
openapi_file = backend_dir / "openapi.json"
frontend_types_file = backend_dir.parent / "frontend" / "lib" / "api" / "types.ts"

schema = json.loads(openapi_file.read_text(encoding="utf-8"))
schemas = schema.get("components", {}).get("schemas", {})

out = """/**
 * This file was auto-generated from openapi.json.
 * Do not make direct changes to the file.
 */

export interface paths {
"""

for path, p_data in schema.get("paths", {}).items():
    out += f'    "{path}": {{\n'
    for method, m_data in p_data.items():
        if method in ["get", "post", "put", "delete", "patch"]:
            op_id = m_data.get("operationId", f"{method}_{path}")
            out += f'        {method}: operations["{op_id}"];\n'
    out += "    };\n"

out += """}

export type webhooks = Record<string, never>;

export interface components {
    schemas: {
"""


def py_type_to_ts(prop_spec):
    if "$ref" in prop_spec:
        ref_name = prop_spec["$ref"].split("/")[-1]
        return f'components["schemas"]["{ref_name}"]'
    if "anyOf" in prop_spec:
        types = [py_type_to_ts(x) for x in prop_spec["anyOf"] if x.get("type") != "null"]
        res = " | ".join(types) if types else "any"
        if any(x.get("type") == "null" for x in prop_spec["anyOf"]):
            res += " | null"
        return res
    t = prop_spec.get("type")
    if t == "string":
        if "enum" in prop_spec:
            return " | ".join(f'"{e}"' for e in prop_spec["enum"])
        return "string"
    elif t in ["integer", "number"]:
        return "number"
    elif t == "boolean":
        return "boolean"
    elif t == "array":
        items = prop_spec.get("items", {})
        return f"{py_type_to_ts(items)}[]"
    elif t == "object":
        add_props = prop_spec.get("additionalProperties")
        if add_props and isinstance(add_props, dict):
            return f"{{ [key: string]: {py_type_to_ts(add_props)} }}"
        return "Record<string, any>"
    return "any"


for s_name, s_spec in schemas.items():
    if "enum" in s_spec:
        enum_vals = " | ".join(f'"{e}"' for e in s_spec["enum"])
        out += f"        /** {s_name} */\n"
        out += f"        {s_name}: {enum_vals};\n"
    elif s_spec.get("type") == "object" or "properties" in s_spec:
        out += f"        /** {s_name} */\n"
        out += f"        {s_name}: {{\n"
        props = s_spec.get("properties", {})
        req = s_spec.get("required", [])
        for p_name, p_spec in props.items():
            is_req = p_name in req
            ts_type = py_type_to_ts(p_spec)
            opt_mark = "" if is_req else "?"
            out += f"            {p_name}{opt_mark}: {ts_type};\n"
        out += "        };\n"
    else:
        out += f"        {s_name}: any;\n"

out += """    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}

export type $defs = Record<string, never>;

export interface operations {
"""

for path, p_data in schema.get("paths", {}).items():
    for method, m_data in p_data.items():
        if method in ["get", "post", "put", "delete", "patch"]:
            op_id = m_data.get("operationId", f"{method}_{path}")
            out += f'    "{op_id}": {{\n'
            out += "        parameters: Record<string, any>;\n"
            out += "        responses: Record<string, any>;\n"
            out += "    };\n"

out += "}\n"

frontend_types_file.write_text(out, encoding="utf-8")
print(f"Generated {frontend_types_file} successfully!")
