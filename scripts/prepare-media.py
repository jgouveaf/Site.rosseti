from pathlib import Path
from PIL import Image,ImageOps,ImageEnhance,ImageFilter
import json, shutil
root=Path(__file__).resolve().parents[1]
source=Path('D:/João Gouvea/Pictures/Imagens pro Site')
album=Path('D:/Temp/Joao/rosseti-assets/album1')
assets=root/'public/media'; photos=[]
# Every mapping is editorial; undated photographs never inherit their digitization date.
items=[
('unity',source/'IMG_20251205_153641918~2.jpg','GameDev com Unity','Programação',2025),
('formatura-turma',source/'IMG_20260630_205317784~2.jpg','Uma conquista compartilhada','Pessoal',2026),
('formatura',source/'IMG_20260630_212305298_HDR.jpg','Registro de formatura','Pessoal',2026),
('liga-escolar',source/'IMG_20261028_085038039_MP~2.jpg','Medalha da Liga Escolar SP','Esportes',None),
('mancini',source/'IMG_20261028_085046091_MP~2.jpg','Medalha Team Mancini','Esportes',None),
('inicup',source/'IMG_20261028_085053156_MP~2.jpg','Inicup TT · campeão Sub-13 masculino','Esportes',2024),
('liga-20',source/'IMG_20261028_085102340_MP~2.jpg','Liga Pró Tênis de Mesa · 20 anos','Esportes',2024),
('futebol-2018',source/'IMG_20261028_085258756_MP~2.jpg','Chute Inicial Ipiranga · vice-campeão Série Ouro','Esportes',2018),
('canguru-2022',source/'IMG_20261028_085321586_MP~2.jpg','Medalha Canguru · inscrição 2022','Olimpíadas',2022),
('kumon',source/'IMG_20261028_085352431_MP~2.jpg','Medalha Kumon · Expo 2017','Olimpíadas',2017),
('canguru',source/'IMG_20261028_085429603_MP~2.jpg','Medalha Canguru de Matemática','Olimpíadas',None),
('zoom',source/'IMG_20261028_085506670_MP~2.jpg','Medalha do Torneio de Robótica Zoom','Robótica',None),
('poliedro',source/'IMG_20261028_085530168_MP~2.jpg','Medalha Poliedro','Olimpíadas',None),
('matchpoint',source/'IMG_20261028_085551345_MP~2.jpg','Match Point · 2º e 3º lugares','Esportes',None),
('natacao',source/'IMG_20261028_085606833_MP~2.jpg','Medalha de natação · Raia 4','Esportes',None),
('infancia-futebol',source/'IMG_20261028_103347812_MP~3.jpg','Infância · encontro em campo','Infância',None),
('infancia-formatura',source/'IMG_20261028_103454263_MP~3.jpg','Infância · primeiros passos','Infância',None),
('infancia-natacao',source/'IMG_20261028_103841135_MP~2.jpg','Infância · alegria na piscina','Infância',None),
('podio',source/'IMG-20241014-WA0002.jpg','Pódio no Match Point','Esportes',2024),
('retrato',album/'2026-10-10-11-30-19-654.jpg','João Gouvêa','Pessoal',2026),
('tenis',album/'3O6A3784.JPG','Foco à mesa','Esportes',None),
('fecart',album/'Fecart-2026 (20) (1).JPG','FECART · apresentação do projeto','Robótica',2026),
('obi',album/'1756598788641.jpg','Classificação para a fase nacional da OBI','Olimpíadas',None),
('infancia-piscina',album/'COOLPIX L1102612_Repaired.JPG','Infância · natação','Infância',None),
('equipe-mancini',album/'IMG_20250920_164421012_MP.jpg','Tênis de mesa · equipe Team Mancini','Esportes',2025),
('premiacao-2024',album/'IMG_20240421_122712014_MP.jpg','Inicup TT · premiação','Esportes',2024),
('esporte-2025',album/'IMG_20250920_164519474_MP~2.jpg','Tênis de mesa · conquista em 2025','Esportes',2025),
('torneio-2026',album/'IMG_20260301_165926707_MP.jpg','Tênis de mesa · torneio em 2026','Esportes',2026),
]
for id,p,title,cat,year in items:
 im=ImageOps.exif_transpose(Image.open(p)).convert('RGB')
 # Gentle conventional treatment, authorized by user. No generative reconstruction.
 im=ImageOps.autocontrast(im,cutoff=0.15,preserve_tone=True)
 im=ImageEnhance.Contrast(im).enhance(1.025)
 if id.startswith('infancia-'): im=im.filter(ImageFilter.MedianFilter(3))
 im=im.filter(ImageFilter.UnsharpMask(radius=1.1,percent=65,threshold=4))
 im.thumbnail((1800,1800),Image.Resampling.LANCZOS)
 full=assets/'photos'/f'{id}.webp';im.save(full,'WEBP',quality=88,method=6)
 thumb=im.copy();thumb.thumbnail((720,900),Image.Resampling.LANCZOS);thumb.save(assets/'photos'/f'{id}-small.webp','WEBP',quality=83,method=6)
 photos.append(dict(id=id,title=title,category=cat,year=year,src=f'media/photos/{id}.webp',thumb=f'media/photos/{id}-small.webp',width=im.width,height=im.height,note='Data do registro fotográfico.' if year and id not in ['inicup','liga-20','futebol-2018','canguru-2022','kumon'] else ''))
certsrc=Path('D:/Temp/Joao/rosseti-assets/certificados')
certs=[]
titles=[('194026_poliedro_prata_2024','Poliedro · prata no documento',2024,'O documento de referência registra prata em 2024. O histórico informado por João registra bronze em 2024 e prata em 2025.'),('194040_concurso_arte_primeiro_2025','Concurso de Arte · 1º lugar',2025,''),('194047_redacao_terceiro_2025','Redação · 3º lugar',2025,''),('194054_desenho_primeiro_2024','Concurso de Arte · 1º lugar',2024,''),('194104_canguru_historico_corrigido','Canguru · histórico informado',None,'Painel de conquistas informado por João. A fotografia de referência menciona honra ao mérito em 2024; o histórico informado registra bronze em 2024.'),('194112_oba_2024','OBA · certificado',2024,''),('194126_oba_2023','OBA · certificado',2023,''),('194201_aluno_criativo_2025','Aluno criativo',2025,''),('194212_poliedro_mencao_2023','Poliedro · menção honrosa no documento',2023,''),('194219_festival_acsi_finalista_2022','ACSI · projeto finalista',None,'O arquivo recebido contém 2022 no nome. O ano da conquista não foi confirmado no histórico informado.'),('194227_supergeeks_unity_2025','SuperGeeks · GameDev Unity',2025,''),('extra_canguru_prata_2025','Canguru · prata',2025,'Painel de conquista informado por João.'),('extra_poliedro_historico_informado','Poliedro · histórico informado',None,'Histórico informado: bronze em 2024 e prata em 2025; diferente do documento de referência.')]
for stem,title,year,note in titles:
 shutil.copy2(certsrc/'para_site_webp'/f'{stem}.webp',assets/'certificates'/f'{stem}.webp')
 shutil.copy2(certsrc/'alta_resolucao_png'/f'{stem}.png',assets/'certificates'/f'{stem}.png')
 certs.append(dict(id=stem,title=title,year=year,category='Certificados',src=f'media/certificates/{stem}.png',thumb=f'media/certificates/{stem}.webp',note=note,representation=True))
shutil.copy2('D:/VID_20260926_133222428~3 (1).mp4',assets/'video/fecart.mp4')
ach=[]
def add(id,title,category,year,result,photo=None): ach.append(dict(id=id,title=title,category=category,year=year,result=result,photo=photo))
for year,res in [(2022,'Honra ao mérito'),(2023,'Honra ao mérito'),(2024,'Bronze'),(2025,'Prata')]: add(f'canguru-{year}','Canguru de Matemática','Olimpíadas',year,res)
for year,res in [(2024,'Bronze'),(2025,'Prata')]: add(f'poliedro-{year}','Matemática Poliedro','Olimpíadas',year,res)
for year in [2022,2023,2024,2025]: add(f'oba-{year}','Astronomia e Astronáutica · OBA','Olimpíadas',year,'Certificado')
for year in [2022,2023,2025]: add(f'obi-{year}','OBI · modalidade Lógica','Programação',year,'Classificação para a fase nacional')
add('obi-programacao','OBI · modalidade Programação','Programação',None,'Classificação para a fase nacional')
for year,res in [(2022,'Bronze'),(2023,'Prata'),(2024,'Ouro'),(2025,'Ouro')]: add(f'zoom-{year}','Torneio de Robótica Zoom','Robótica',year,res)
for level in [1,2,3]: add(f'games-{level}',f'Games · Level {level}','Programação',None,'Concluído')
add('unity','GameDev · Unity','Programação',2025,'Conclusão de curso','unity')
for year in [2024,2025]: add(f'arte-{year}','Concurso de Arte','Arte',year,'1º lugar')
add('redacao','Concurso de Redação','Arte',2025,'3º lugar')
add('acsi','ACSI','Projetos',None,'Projeto finalista')
add('italianwhey','ItalianWhey','Projetos',2025,'Vencedor · trabalho de Publicidade e Propaganda de Escolas')
add('kumon','Kumon · Matemática','Olimpíadas',None,'Medalha de bronze','kumon')
add('swimming','Natação','Esportes',None,'16 medalhas','natacao')
add('table-tennis','Tênis de mesa','Esportes',None,'10 medalhas','podio')
add('futsal','Futsal','Esportes',None,'Kogachi · Democrático Futsal','infancia-futebol')
add('inicup','Inicup TT','Esportes',2024,'Campeão Sub-13 masculino · 21 de abril','inicup')
add('futebol-2018','Chute Inicial Ipiranga','Esportes',2018,'Vice-campeão · Série Ouro','futebol-2018')
add('kumon-2017','Kumon · Expo 2017','Olimpíadas',2017,'Registro da medalha','kumon')
add('fecart','FECART','Projetos',2026,'Apresentação do projeto','fecart')
data=dict(profile=dict(name='João Gouvêa',age=15,school='FECAP',schoolYear='1º ano do Ensino Médio',course='Inteligência Artificial',english='B2'),sports=dict(swimmingMedals=16,tableTennisMedals=10,futsalClubs=['Kogachi','Democrático Futsal']),photos=photos,certificates=certs,achievements=ach)
(root/'src/data/portfolio.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(photos)} photos; {len(certs)} representations; {len(ach)} achievements')

