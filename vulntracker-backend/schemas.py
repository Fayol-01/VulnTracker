from marshmallow import Schema, fields

class VendorSchema(Schema):
    name = fields.Str(required=True)
    website = fields.Str()

class SoftwareSchema(Schema):
    name = fields.Str(required=True)
    vendor_id = fields.Int(required=True)
    version = fields.Str()

class VulnerabilitySchema(Schema):
    software_id = fields.Int(required=True)
    cve_id = fields.Str(required=True)
    cvss_score = fields.Float()
    summary = fields.Str()
    severity = fields.Str(validate=lambda x: x in ['Critical', 'High', 'Medium', 'Low'])
    published = fields.DateTime()

class PatchSchema(Schema):
    vulnerability_id = fields.Int(required=True)
    url = fields.Str(required=True)
    released = fields.DateTime()

class ThreatSchema(Schema):
    name = fields.Str(required=True)
    description = fields.Str()
    threat_type_id = fields.Int(required=True)

class ThreatTypeSchema(Schema):
    name = fields.Str(required=True)
    description = fields.Str()

class VulnerabilityThreatSchema(Schema):
    vulnerability_id = fields.Int(required=True)
    threat_id = fields.Int(required=True)