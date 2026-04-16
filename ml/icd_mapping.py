"""
ICD-10 Code Mapping System
Maps medical specialties and clinical keywords to ICD-10 codes.
"""

# Comprehensive mapping of medical specialties to ICD-10 code ranges
SPECIALTY_TO_ICD = {
    "Allergy / Immunology": [
        {"code": "J30.1", "description": "Allergic rhinitis due to pollen", "category": "Respiratory"},
        {"code": "J30.9", "description": "Allergic rhinitis, unspecified", "category": "Respiratory"},
        {"code": "J45.20", "description": "Mild intermittent asthma, uncomplicated", "category": "Respiratory"},
        {"code": "J45.909", "description": "Unspecified asthma, uncomplicated", "category": "Respiratory"},
        {"code": "T78.40XA", "description": "Allergy, unspecified, initial encounter", "category": "Injury"},
        {"code": "L50.0", "description": "Allergic urticaria", "category": "Skin"},
        {"code": "D89.9", "description": "Disorder involving immune mechanism, unspecified", "category": "Blood"},
    ],
    "Bariatrics": [
        {"code": "E66.01", "description": "Morbid (severe) obesity due to excess calories", "category": "Endocrine"},
        {"code": "E66.09", "description": "Other obesity due to excess calories", "category": "Endocrine"},
        {"code": "E66.9", "description": "Obesity, unspecified", "category": "Endocrine"},
        {"code": "Z68.41", "description": "Body mass index [BMI] 40.0-44.9, adult", "category": "Factors"},
        {"code": "Z68.42", "description": "Body mass index [BMI] 45.0-49.9, adult", "category": "Factors"},
        {"code": "Z68.43", "description": "Body mass index [BMI] 50.0-59.9, adult", "category": "Factors"},
        {"code": "K21.0", "description": "Gastro-esophageal reflux disease with esophagitis", "category": "Digestive"},
    ],
    "Cardiovascular / Pulmonary": [
        {"code": "I25.10", "description": "Atherosclerotic heart disease of native coronary artery", "category": "Circulatory"},
        {"code": "I50.9", "description": "Heart failure, unspecified", "category": "Circulatory"},
        {"code": "I10", "description": "Essential (primary) hypertension", "category": "Circulatory"},
        {"code": "I48.91", "description": "Unspecified atrial fibrillation", "category": "Circulatory"},
        {"code": "I35.0", "description": "Nonrheumatic aortic (valve) stenosis", "category": "Circulatory"},
        {"code": "I34.0", "description": "Nonrheumatic mitral (valve) insufficiency", "category": "Circulatory"},
        {"code": "I36.1", "description": "Nonrheumatic tricuspid (valve) insufficiency", "category": "Circulatory"},
        {"code": "J44.1", "description": "Chronic obstructive pulmonary disease with acute exacerbation", "category": "Respiratory"},
        {"code": "J96.90", "description": "Respiratory failure, unspecified", "category": "Respiratory"},
        {"code": "I26.99", "description": "Other pulmonary embolism without acute cor pulmonale", "category": "Circulatory"},
        {"code": "I27.20", "description": "Pulmonary hypertension, unspecified", "category": "Circulatory"},
    ],
    "Dentistry": [
        {"code": "K01.1", "description": "Impacted teeth", "category": "Digestive"},
        {"code": "K08.101", "description": "Complete loss of teeth due to caries", "category": "Digestive"},
        {"code": "K02.9", "description": "Dental caries, unspecified", "category": "Digestive"},
        {"code": "K05.10", "description": "Chronic gingivitis, plaque induced", "category": "Digestive"},
    ],
    "Dermatology": [
        {"code": "L30.9", "description": "Dermatitis, unspecified", "category": "Skin"},
        {"code": "L40.0", "description": "Psoriasis vulgaris", "category": "Skin"},
        {"code": "C43.9", "description": "Malignant melanoma of skin, unspecified", "category": "Neoplasm"},
        {"code": "L82.1", "description": "Other seborrheic keratosis", "category": "Skin"},
        {"code": "L70.0", "description": "Acne vulgaris", "category": "Skin"},
    ],
    "ENT - Otolaryngology": [
        {"code": "J32.9", "description": "Chronic sinusitis, unspecified", "category": "Respiratory"},
        {"code": "J35.01", "description": "Chronic tonsillitis", "category": "Respiratory"},
        {"code": "H66.90", "description": "Otitis media, unspecified, unspecified ear", "category": "Ear"},
        {"code": "J38.00", "description": "Paralysis of vocal cords and larynx, unspecified", "category": "Respiratory"},
        {"code": "H91.90", "description": "Unspecified hearing loss, unspecified ear", "category": "Ear"},
    ],
    "Emergency Room Reports": [
        {"code": "R55", "description": "Syncope and collapse", "category": "Symptoms"},
        {"code": "R10.9", "description": "Unspecified abdominal pain", "category": "Symptoms"},
        {"code": "R07.9", "description": "Chest pain, unspecified", "category": "Symptoms"},
        {"code": "S00.90XA", "description": "Unspecified superficial injury of head, initial encounter", "category": "Injury"},
        {"code": "T78.2XXA", "description": "Anaphylactic shock, unspecified, initial encounter", "category": "Injury"},
    ],
    "Endocrinology": [
        {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications", "category": "Endocrine"},
        {"code": "E10.9", "description": "Type 1 diabetes mellitus without complications", "category": "Endocrine"},
        {"code": "E03.9", "description": "Hypothyroidism, unspecified", "category": "Endocrine"},
        {"code": "E05.90", "description": "Thyrotoxicosis, unspecified without thyrotoxic crisis", "category": "Endocrine"},
        {"code": "E21.0", "description": "Primary hyperparathyroidism", "category": "Endocrine"},
    ],
    "Gastroenterology": [
        {"code": "K21.0", "description": "Gastro-esophageal reflux disease with esophagitis", "category": "Digestive"},
        {"code": "K25.9", "description": "Gastric ulcer, unspecified, without hemorrhage or perforation", "category": "Digestive"},
        {"code": "K50.90", "description": "Crohn's disease, unspecified, without complications", "category": "Digestive"},
        {"code": "K51.90", "description": "Ulcerative colitis, unspecified, without complications", "category": "Digestive"},
        {"code": "K76.0", "description": "Fatty (change of) liver, not elsewhere classified", "category": "Digestive"},
        {"code": "K80.20", "description": "Calculus of gallbladder without cholecystitis without obstruction", "category": "Digestive"},
    ],
    "General Medicine": [
        {"code": "J06.9", "description": "Acute upper respiratory infection, unspecified", "category": "Respiratory"},
        {"code": "R50.9", "description": "Fever, unspecified", "category": "Symptoms"},
        {"code": "I10", "description": "Essential (primary) hypertension", "category": "Circulatory"},
        {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications", "category": "Endocrine"},
        {"code": "J18.9", "description": "Pneumonia, unspecified organism", "category": "Respiratory"},
    ],
    "Hematology - Oncology": [
        {"code": "D64.9", "description": "Anemia, unspecified", "category": "Blood"},
        {"code": "C80.1", "description": "Malignant (primary) neoplasm, unspecified", "category": "Neoplasm"},
        {"code": "D70.9", "description": "Neutropenia, unspecified", "category": "Blood"},
        {"code": "C34.90", "description": "Malignant neoplasm of unspecified part of bronchus or lung", "category": "Neoplasm"},
        {"code": "D69.6", "description": "Thrombocytopenia, unspecified", "category": "Blood"},
    ],
    "Nephrology": [
        {"code": "N18.6", "description": "End stage renal disease", "category": "Genitourinary"},
        {"code": "N18.9", "description": "Chronic kidney disease, unspecified", "category": "Genitourinary"},
        {"code": "N17.9", "description": "Acute kidney failure, unspecified", "category": "Genitourinary"},
        {"code": "N04.9", "description": "Nephrotic syndrome with unspecified morphologic changes", "category": "Genitourinary"},
    ],
    "Neurology": [
        {"code": "G43.909", "description": "Migraine, unspecified, not intractable, without status migrainosus", "category": "Nervous"},
        {"code": "G40.909", "description": "Epilepsy, unspecified, not intractable, without status epilepticus", "category": "Nervous"},
        {"code": "I63.9", "description": "Cerebral infarction, unspecified", "category": "Circulatory"},
        {"code": "G20", "description": "Parkinson's disease", "category": "Nervous"},
        {"code": "G35", "description": "Multiple sclerosis", "category": "Nervous"},
        {"code": "G30.9", "description": "Alzheimer's disease, unspecified", "category": "Nervous"},
    ],
    "Neurosurgery": [
        {"code": "G91.9", "description": "Hydrocephalus, unspecified", "category": "Nervous"},
        {"code": "M51.16", "description": "Intervertebral disc disorders with radiculopathy, lumbar region", "category": "Musculoskeletal"},
        {"code": "S06.9X0A", "description": "Unspecified intracranial injury without loss of consciousness", "category": "Injury"},
        {"code": "C71.9", "description": "Malignant neoplasm of brain, unspecified", "category": "Neoplasm"},
    ],
    "Obstetrics / Gynecology": [
        {"code": "O80", "description": "Encounter for full-term uncomplicated delivery", "category": "Pregnancy"},
        {"code": "N92.0", "description": "Excessive and frequent menstruation with regular cycle", "category": "Genitourinary"},
        {"code": "D25.9", "description": "Leiomyoma of uterus, unspecified", "category": "Neoplasm"},
        {"code": "N81.2", "description": "Incomplete uterovaginal prolapse", "category": "Genitourinary"},
        {"code": "Z30.09", "description": "Encounter for other general counseling on contraception", "category": "Factors"},
    ],
    "Ophthalmology": [
        {"code": "H40.10X0", "description": "Unspecified open-angle glaucoma, stage unspecified", "category": "Eye"},
        {"code": "H25.9", "description": "Unspecified age-related cataract", "category": "Eye"},
        {"code": "H35.30", "description": "Unspecified macular degeneration", "category": "Eye"},
        {"code": "E11.319", "description": "Type 2 diabetes with unspecified diabetic retinopathy without macular edema", "category": "Endocrine"},
    ],
    "Orthopedic": [
        {"code": "M17.11", "description": "Primary osteoarthritis, right knee", "category": "Musculoskeletal"},
        {"code": "S82.90XA", "description": "Unspecified fracture of unspecified lower leg, initial encounter", "category": "Injury"},
        {"code": "M54.5", "description": "Low back pain", "category": "Musculoskeletal"},
        {"code": "M75.110", "description": "Incomplete rotator cuff tear of right shoulder", "category": "Musculoskeletal"},
        {"code": "M23.611", "description": "Other spontaneous disruption of anterior cruciate ligament of right knee", "category": "Musculoskeletal"},
        {"code": "S72.001A", "description": "Fracture of unspecified part of neck of right femur, initial encounter", "category": "Injury"},
    ],
    "Pain Management": [
        {"code": "G89.29", "description": "Other chronic pain", "category": "Nervous"},
        {"code": "M54.5", "description": "Low back pain", "category": "Musculoskeletal"},
        {"code": "G89.4", "description": "Chronic pain syndrome", "category": "Nervous"},
        {"code": "M79.3", "description": "Panniculitis, unspecified", "category": "Musculoskeletal"},
    ],
    "Pediatrics - Neonatal": [
        {"code": "P07.39", "description": "Other low birth weight newborn", "category": "Perinatal"},
        {"code": "P22.0", "description": "Respiratory distress syndrome of newborn", "category": "Perinatal"},
        {"code": "P59.9", "description": "Neonatal jaundice, unspecified", "category": "Perinatal"},
        {"code": "J06.9", "description": "Acute upper respiratory infection, unspecified", "category": "Respiratory"},
    ],
    "Physical Medicine - Rehab": [
        {"code": "M62.81", "description": "Muscle weakness (generalized)", "category": "Musculoskeletal"},
        {"code": "Z96.641", "description": "Presence of right artificial hip joint", "category": "Factors"},
        {"code": "I63.9", "description": "Cerebral infarction, unspecified", "category": "Circulatory"},
    ],
    "Podiatry": [
        {"code": "L60.0", "description": "Ingrowing nail", "category": "Skin"},
        {"code": "M20.10", "description": "Hallux valgus (acquired), unspecified foot", "category": "Musculoskeletal"},
        {"code": "L97.509", "description": "Non-pressure chronic ulcer of other part of unspecified foot", "category": "Skin"},
    ],
    "Psychiatry / Psychology": [
        {"code": "F32.9", "description": "Major depressive disorder, single episode, unspecified", "category": "Mental"},
        {"code": "F41.1", "description": "Generalized anxiety disorder", "category": "Mental"},
        {"code": "F31.9", "description": "Bipolar disorder, unspecified", "category": "Mental"},
        {"code": "F20.9", "description": "Schizophrenia, unspecified", "category": "Mental"},
        {"code": "F43.10", "description": "Post-traumatic stress disorder, unspecified", "category": "Mental"},
    ],
    "Radiology": [
        {"code": "Z12.31", "description": "Encounter for screening mammogram for malignant neoplasm of breast", "category": "Factors"},
        {"code": "R93.89", "description": "Abnormal findings on diagnostic imaging of other specified body structures", "category": "Symptoms"},
    ],
    "Rheumatology": [
        {"code": "M06.9", "description": "Rheumatoid arthritis, unspecified", "category": "Musculoskeletal"},
        {"code": "M32.9", "description": "Systemic lupus erythematosus, unspecified", "category": "Musculoskeletal"},
        {"code": "M10.9", "description": "Gout, unspecified", "category": "Musculoskeletal"},
        {"code": "M35.9", "description": "Systemic involvement of connective tissue, unspecified", "category": "Musculoskeletal"},
    ],
    "Sleep Medicine": [
        {"code": "G47.33", "description": "Obstructive sleep apnea (adult) (pediatric)", "category": "Nervous"},
        {"code": "G47.00", "description": "Insomnia, unspecified", "category": "Nervous"},
        {"code": "G47.9", "description": "Sleep disorder, unspecified", "category": "Nervous"},
    ],
    "SOAP / Chart / Progress Notes": [
        {"code": "Z00.00", "description": "Encounter for general adult medical examination without abnormal findings", "category": "Factors"},
        {"code": "R69", "description": "Illness, unspecified", "category": "Symptoms"},
    ],
    "Speech - Language": [
        {"code": "R47.1", "description": "Dysarthria and anarthria", "category": "Symptoms"},
        {"code": "R13.10", "description": "Dysphagia, unspecified", "category": "Symptoms"},
        {"code": "F80.9", "description": "Developmental disorder of speech and language, unspecified", "category": "Mental"},
    ],
    "Surgery": [
        {"code": "K35.80", "description": "Unspecified acute appendicitis", "category": "Digestive"},
        {"code": "K40.90", "description": "Unilateral inguinal hernia, without obstruction or gangrene, not specified as recurrent", "category": "Digestive"},
        {"code": "K80.20", "description": "Calculus of gallbladder without cholecystitis without obstruction", "category": "Digestive"},
        {"code": "T81.4XXA", "description": "Infection following a procedure, initial encounter", "category": "Injury"},
    ],
    "Urology": [
        {"code": "N40.0", "description": "Benign prostatic hyperplasia without lower urinary tract symptoms", "category": "Genitourinary"},
        {"code": "C61", "description": "Malignant neoplasm of prostate", "category": "Neoplasm"},
        {"code": "N20.0", "description": "Calculus of kidney", "category": "Genitourinary"},
        {"code": "N39.0", "description": "Urinary tract infection, site not specified", "category": "Genitourinary"},
        {"code": "N32.81", "description": "Overactive bladder", "category": "Genitourinary"},
        {"code": "Z30.2", "description": "Encounter for sterilization", "category": "Factors"},
    ],
    "Autopsy": [
        {"code": "R99", "description": "Ill-defined and unknown cause of mortality", "category": "Symptoms"},
        {"code": "T14.90XA", "description": "Injury, unspecified, initial encounter", "category": "Injury"},
    ],
    "Chiropractic": [
        {"code": "M54.5", "description": "Low back pain", "category": "Musculoskeletal"},
        {"code": "M99.01", "description": "Segmental and somatic dysfunction of cervical region", "category": "Musculoskeletal"},
    ],
    "Cosmetic / Plastic Surgery": [
        {"code": "Z41.1", "description": "Encounter for cosmetic surgery", "category": "Factors"},
        {"code": "N62", "description": "Hypertrophy of breast", "category": "Genitourinary"},
    ],
    "Discharge Summary": [
        {"code": "Z87.89", "description": "Personal history of other specified conditions", "category": "Factors"},
        {"code": "Z86.19", "description": "Personal history of other infectious and parasitic diseases", "category": "Factors"},
    ],
    "Hospice - Palliative Care": [
        {"code": "Z51.5", "description": "Encounter for palliative care", "category": "Factors"},
        {"code": "R52", "description": "Pain, unspecified", "category": "Symptoms"},
    ],
    "IME-QME-Work Comp etc.": [
        {"code": "Z04.6", "description": "Encounter for general psychiatric examination, requested by authority", "category": "Factors"},
        {"code": "Z02.79", "description": "Encounter for issue of other medical certificate", "category": "Factors"},
    ],
    "Lab Medicine - Pathology": [
        {"code": "R79.89", "description": "Other specified abnormal findings of blood chemistry", "category": "Symptoms"},
        {"code": "R83.6", "description": "Abnormal findings in specimens from nervous system and sense organs - abnormal cytological findings", "category": "Symptoms"},
    ],
    "Letters": [
        {"code": "Z76.0", "description": "Encounter for issue of repeat prescription", "category": "Factors"},
    ],
    "Office Notes": [
        {"code": "Z00.00", "description": "Encounter for general adult medical examination without abnormal findings", "category": "Factors"},
    ],
    "Consult - History and Phy.": [
        {"code": "Z71.89", "description": "Other specified counseling", "category": "Factors"},
    ],
}

# Keyword-based ICD code mapping for more specific predictions
KEYWORD_TO_ICD = {
    # Cardiovascular
    "hypertension": {"code": "I10", "description": "Essential (primary) hypertension"},
    "heart failure": {"code": "I50.9", "description": "Heart failure, unspecified"},
    "atrial fibrillation": {"code": "I48.91", "description": "Unspecified atrial fibrillation"},
    "coronary artery disease": {"code": "I25.10", "description": "Atherosclerotic heart disease"},
    "myocardial infarction": {"code": "I21.9", "description": "Acute myocardial infarction, unspecified"},
    "aortic stenosis": {"code": "I35.0", "description": "Nonrheumatic aortic valve stenosis"},
    "mitral regurgitation": {"code": "I34.0", "description": "Nonrheumatic mitral valve insufficiency"},
    "tricuspid regurgitation": {"code": "I36.1", "description": "Nonrheumatic tricuspid valve insufficiency"},
    "pulmonary embolism": {"code": "I26.99", "description": "Other pulmonary embolism"},
    "deep venous thrombosis": {"code": "I82.90", "description": "DVT of unspecified vein"},
    "dvt": {"code": "I82.90", "description": "DVT of unspecified vein"},
    "chest pain": {"code": "R07.9", "description": "Chest pain, unspecified"},
    "pericardial effusion": {"code": "I31.3", "description": "Pericardial effusion (noninflammatory)"},
    
    # Respiratory
    "asthma": {"code": "J45.909", "description": "Unspecified asthma, uncomplicated"},
    "pneumonia": {"code": "J18.9", "description": "Pneumonia, unspecified organism"},
    "copd": {"code": "J44.1", "description": "COPD with acute exacerbation"},
    "emphysema": {"code": "J43.9", "description": "Emphysema, unspecified"},
    "sleep apnea": {"code": "G47.33", "description": "Obstructive sleep apnea"},
    "bronchitis": {"code": "J40", "description": "Bronchitis, not specified as acute or chronic"},
    "respiratory failure": {"code": "J96.90", "description": "Respiratory failure, unspecified"},
    "pulmonary hypertension": {"code": "I27.20", "description": "Pulmonary hypertension, unspecified"},
    "pleural effusion": {"code": "J90", "description": "Pleural effusion, not elsewhere classified"},
    
    # Endocrine
    "diabetes": {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications"},
    "type 2 diabetes": {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications"},
    "type 1 diabetes": {"code": "E10.9", "description": "Type 1 diabetes mellitus without complications"},
    "hypothyroidism": {"code": "E03.9", "description": "Hypothyroidism, unspecified"},
    "hyperthyroidism": {"code": "E05.90", "description": "Thyrotoxicosis, unspecified"},
    "obesity": {"code": "E66.9", "description": "Obesity, unspecified"},
    "morbid obesity": {"code": "E66.01", "description": "Morbid (severe) obesity due to excess calories"},
    
    # GI
    "gastroesophageal reflux": {"code": "K21.0", "description": "GERD with esophagitis"},
    "gerd": {"code": "K21.0", "description": "GERD with esophagitis"},
    "peptic ulcer": {"code": "K25.9", "description": "Gastric ulcer, unspecified"},
    "gallstones": {"code": "K80.20", "description": "Calculus of gallbladder"},
    "cholecystitis": {"code": "K81.9", "description": "Cholecystitis, unspecified"},
    "appendicitis": {"code": "K35.80", "description": "Unspecified acute appendicitis"},
    "cirrhosis": {"code": "K74.60", "description": "Unspecified cirrhosis of liver"},
    "hepatitis": {"code": "K73.9", "description": "Chronic hepatitis, unspecified"},
    "pancreatitis": {"code": "K85.90", "description": "Acute pancreatitis, unspecified"},
    "hernia": {"code": "K40.90", "description": "Unilateral inguinal hernia"},
    "umbilical hernia": {"code": "K42.9", "description": "Umbilical hernia without obstruction or gangrene"},
    "hemorrhoids": {"code": "K64.9", "description": "Unspecified hemorrhoids"},
    
    # Musculoskeletal
    "low back pain": {"code": "M54.5", "description": "Low back pain"},
    "back pain": {"code": "M54.9", "description": "Dorsalgia, unspecified"},
    "osteoarthritis": {"code": "M19.90", "description": "Unspecified osteoarthritis, unspecified site"},
    "rheumatoid arthritis": {"code": "M06.9", "description": "Rheumatoid arthritis, unspecified"},
    "rotator cuff": {"code": "M75.110", "description": "Incomplete rotator cuff tear"},
    "fracture": {"code": "T14.8XXA", "description": "Other injury of unspecified body region"},
    "knee pain": {"code": "M25.569", "description": "Pain in unspecified knee"},
    "hip pain": {"code": "M25.559", "description": "Pain in unspecified hip"},
    
    # Neurological
    "stroke": {"code": "I63.9", "description": "Cerebral infarction, unspecified"},
    "seizure": {"code": "R56.9", "description": "Unspecified convulsions"},
    "epilepsy": {"code": "G40.909", "description": "Epilepsy, unspecified"},
    "migraine": {"code": "G43.909", "description": "Migraine, unspecified"},
    "headache": {"code": "R51.9", "description": "Headache, unspecified"},
    "alzheimer": {"code": "G30.9", "description": "Alzheimer's disease, unspecified"},
    "parkinson": {"code": "G20", "description": "Parkinson's disease"},
    "multiple sclerosis": {"code": "G35", "description": "Multiple sclerosis"},
    "neuropathy": {"code": "G62.9", "description": "Polyneuropathy, unspecified"},
    
    # Genitourinary
    "urinary tract infection": {"code": "N39.0", "description": "UTI, site not specified"},
    "uti": {"code": "N39.0", "description": "UTI, site not specified"},
    "kidney stone": {"code": "N20.0", "description": "Calculus of kidney"},
    "renal failure": {"code": "N17.9", "description": "Acute kidney failure, unspecified"},
    "chronic kidney disease": {"code": "N18.9", "description": "Chronic kidney disease, unspecified"},
    "prostate cancer": {"code": "C61", "description": "Malignant neoplasm of prostate"},
    "prostatic hyperplasia": {"code": "N40.0", "description": "Benign prostatic hyperplasia"},
    "bph": {"code": "N40.0", "description": "Benign prostatic hyperplasia"},
    "incontinence": {"code": "R32", "description": "Unspecified urinary incontinence"},
    "hematuria": {"code": "R31.9", "description": "Hematuria, unspecified"},
    "bladder cancer": {"code": "C67.9", "description": "Malignant neoplasm of bladder, unspecified"},
    
    # Mental Health
    "depression": {"code": "F32.9", "description": "Major depressive disorder, unspecified"},
    "anxiety": {"code": "F41.9", "description": "Anxiety disorder, unspecified"},
    "bipolar": {"code": "F31.9", "description": "Bipolar disorder, unspecified"},
    "schizophrenia": {"code": "F20.9", "description": "Schizophrenia, unspecified"},
    "ptsd": {"code": "F43.10", "description": "Post-traumatic stress disorder, unspecified"},
    
    # Neoplasms
    "cancer": {"code": "C80.1", "description": "Malignant neoplasm, unspecified"},
    "tumor": {"code": "D49.9", "description": "Neoplasm of unspecified behavior"},
    "malignant": {"code": "C80.1", "description": "Malignant neoplasm, unspecified"},
    "carcinoma": {"code": "C80.1", "description": "Malignant neoplasm, unspecified"},
    "melanoma": {"code": "C43.9", "description": "Malignant melanoma of skin, unspecified"},
    "lymphoma": {"code": "C85.90", "description": "Non-Hodgkin lymphoma, unspecified"},
    "leukemia": {"code": "C95.90", "description": "Leukemia, unspecified"},
    "breast cancer": {"code": "C50.919", "description": "Malignant neoplasm of breast"},
    "lung cancer": {"code": "C34.90", "description": "Malignant neoplasm of lung"},
    
    # Blood
    "anemia": {"code": "D64.9", "description": "Anemia, unspecified"},
    "thrombocytopenia": {"code": "D69.6", "description": "Thrombocytopenia, unspecified"},
    "neutropenia": {"code": "D70.9", "description": "Neutropenia, unspecified"},
    "coagulopathy": {"code": "D68.9", "description": "Coagulation defect, unspecified"},
    
    # Infectious
    "sepsis": {"code": "A41.9", "description": "Sepsis, unspecified organism"},
    "cellulitis": {"code": "L03.90", "description": "Cellulitis, unspecified"},
    "abscess": {"code": "L02.91", "description": "Cutaneous abscess, unspecified"},
    
    # Procedures/Encounters
    "vasectomy": {"code": "Z30.2", "description": "Encounter for sterilization"},
    "gastric bypass": {"code": "Z98.84", "description": "Bariatric surgery status"},
    "lap band": {"code": "Z98.84", "description": "Bariatric surgery status"},
    "colonoscopy": {"code": "Z12.11", "description": "Encounter for screening for malignant neoplasm of colon"},
    "biopsy": {"code": "Z12.9", "description": "Encounter for screening for malignant neoplasm, unspecified"},
}


def get_icd_codes_for_text(text: str, specialty: str = None) -> list:
    """
    Get relevant ICD codes based on clinical text and optional specialty.
    Returns list of dicts with code, description, confidence, and evidence.
    """
    text_lower = text.lower()
    results = []
    seen_codes = set()
    
    # First: keyword-based matches (highest specificity)
    for keyword, icd_info in KEYWORD_TO_ICD.items():
        if keyword in text_lower:
            code = icd_info["code"]
            if code not in seen_codes:
                # Find evidence spans
                start_idx = text_lower.find(keyword)
                evidence = text[max(0, start_idx - 50):start_idx + len(keyword) + 50]
                results.append({
                    "code": code,
                    "description": icd_info["description"],
                    "confidence": 0.0,  # Will be set by ML model
                    "evidence": evidence.strip(),
                    "matched_keyword": keyword,
                    "source": "keyword"
                })
                seen_codes.add(code)
    
    # Second: specialty-based matches
    if specialty and specialty in SPECIALTY_TO_ICD:
        for icd_info in SPECIALTY_TO_ICD[specialty]:
            code = icd_info["code"]
            if code not in seen_codes:
                results.append({
                    "code": code,
                    "description": icd_info["description"],
                    "confidence": 0.0,
                    "evidence": f"Matched via specialty: {specialty}",
                    "matched_keyword": specialty,
                    "source": "specialty"
                })
                seen_codes.add(code)
    
    return results
