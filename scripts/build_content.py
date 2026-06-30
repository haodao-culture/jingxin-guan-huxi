from __future__ import annotations

import json
from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "guan-huxi-original.local.docx"
OUT = ROOT / "content-data.js"

PUBLIC_EXCLUDED_PARAGRAPH_INDICES = {63, 64, 66}


def read_paragraphs() -> list[str]:
    doc = Document(SOURCE)
    paragraphs: list[str] = []
    for para in doc.paragraphs:
        text = "".join(run.text for run in para.runs).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


CHAPTERS = [
    {
        "part": "PART I",
        "partTitle": "淨念而靜心",
        "title": "心入禪定",
        "subtitle": "「淨」而後能「靜」，「靜」而後能「定」",
        "range": (0, 3),
        "quoteIndex": 2,
        "takeaways": ["心定為主", "靜心是基礎的練習", "讓真人醒過來"],
        "practice": "先理解這是一門以心為主的基本功，不急著追求覺受或境界。",
        "questions": ["我現在是在練身體的姿勢，還是在練心的清淨？"],
    },
    {
        "part": "PART I",
        "partTitle": "淨念而靜心",
        "title": "做一次觀呼吸",
        "subtitle": "不必數息，不用管呼吸的長短",
        "range": (3, 11),
        "quoteIndex": 5,
        "takeaways": ["只是「觀」呼吸", "一覺察，收心回到「觀」呼吸", "除了這一念，別無他念"],
        "practice": "眼睛八分閉兩分開，安全安靜地練 3 到 10 分鐘；念頭起來，就回到「觀」呼吸。",
        "questions": ["我有沒有又開始解讀、批判、延伸呼吸？"],
    },
    {
        "part": "PART I",
        "partTitle": "淨念而靜心",
        "title": "萬念聚於一念",
        "subtitle": "聚於呼吸之間的「觀」",
        "range": (11, 22),
        "quoteIndex": 13,
        "takeaways": ["先練前半段", "要常態化練習", "覺性接手在觀"],
        "practice": "在行、住、坐、臥中短暫練習，把紛飛的念收攝成呼吸之間的一念。",
        "questions": ["我是在收攝萬念，還是在創造更多意念？"],
    },
    {
        "part": "PART II",
        "partTitle": "日常收心",
        "title": "隨時可修煉的收心",
        "subtitle": "一覺察心念外放即刻收心",
        "range": (22, 31),
        "quoteIndex": 27,
        "takeaways": ["淺層觀呼吸", "即念起不隨", "回到呼吸之間的「觀」呼吸"],
        "practice": "上班、對應人事、情緒起伏時，只做淺層觀呼吸，覺察到外放就收回。",
        "questions": ["我能不能在情緒還沒相續之前，立刻回頭？"],
    },
    {
        "part": "PART II",
        "partTitle": "日常收心",
        "title": "姿態、鬆身與不急",
        "subtitle": "越急越遠",
        "range": (31, 40),
        "quoteIndex": 33,
        "takeaways": ["以不引起意識作用為考慮", "八分出世間，二分於世間", "抱樸守真、抱元守一"],
        "practice": "觀呼吸前先掃描身體壓迫處，調整放鬆；保持自然眼張度，不追求花俏作為。",
        "questions": ["我的姿勢有沒有讓意識更用力、更緊張？"],
    },
    {
        "part": "PART II",
        "partTitle": "日常收心",
        "title": "意識觀與覺性觀",
        "subtitle": "以妄心降妄念，真心觀妄心",
        "range": (40, 49),
        "quoteIndex": 41,
        "takeaways": ["不分析不判斷不延伸", "真心觀妄心", "定靜、降伏、出離"],
        "practice": "辨識自己是在用意識觀止，或已能自然只是看著；都不必急著命名境界。",
        "questions": ["此刻的觀，是在分析，還是只是如日照著？"],
    },
    {
        "part": "PART II",
        "partTitle": "日常收心",
        "title": "百日基本功與日常練習",
        "subtitle": "清醒、日常忙碌時，修煉觀呼吸",
        "range": (49, 79),
        "quoteIndex": 67,
        "takeaways": ["堅持一百天", "以覺為師", "白天清醒時修煉"],
        "practice": "把觀呼吸放在清醒日常，而不只睡前；用心得記錄檢驗自己是否真的在修煉。",
        "questions": ["我有沒有把觀呼吸帶入日常忙碌之中？"],
    },
    {
        "part": "PART III",
        "partTitle": "心法與效益",
        "title": "觀呼吸的心法修煉",
        "subtitle": "讓「觀」成為平時的常態化狀態",
        "range": (79, 90),
        "quoteIndex": 88,
        "takeaways": ["念起不隨", "生無住心", "再深修、真修「觀呼吸」"],
        "practice": "隔幾天重讀一次，對照自己少修了哪些內修部分，避免只在表面形式上修煉。",
        "questions": ["我能不能在「入、住、出」中不住、不執、不染？"],
    },
    {
        "part": "PART III",
        "partTitle": "心法與效益",
        "title": "觀呼吸的一些效益",
        "subtitle": "覺察、覺知、知止、收心",
        "range": (90, 103),
        "quoteIndex": 91,
        "takeaways": ["覺察會更敏銳", "覺知也啟動了", "不再入「幻、妄」之境"],
        "practice": "用覺察、覺知、知止、收心的疊加，練到境界來臨前就能回到所修功課。",
        "questions": ["我有沒有在行因之前，看見內在的心因？"],
    },
    {
        "part": "PART III",
        "partTitle": "心法與效益",
        "title": "安住於內、安住於當下",
        "subtitle": "每天有一小段時間跟自己在一起",
        "range": (103, 114),
        "quoteIndex": 103,
        "takeaways": ["安定、清靜我們的那顆心", "高維心智", "此真人現也"],
        "practice": "每天留一小段時間觀呼吸，練習快速平靜、祥和內心，讓「觀」常態化。",
        "questions": ["我能不能在內外境變動時，仍然收心靜意？"],
    },
    {
        "part": "PART IV",
        "partTitle": "深入觀照",
        "title": "捨識用根、捨根聞性",
        "subtitle": "捨識者是誰？誰在捨？",
        "range": (114, 142),
        "quoteIndex": 115,
        "takeaways": ["誰在捨", "聞者是誰", "成真者誰"],
        "practice": "把這一章作為觀照提問，不急於回答；讓問題回到當下的觀與覺。",
        "questions": ["所聞的「性」，能用言語形容嗎？"],
    },
    {
        "part": "PART IV",
        "partTitle": "深入觀照",
        "title": "沒有存在感的存在",
        "subtitle": "在而不在，不在而在",
        "range": (142, 165),
        "quoteIndex": 163,
        "takeaways": ["自我止息", "沒有存在感的覺受", "自我以止息與大海本性合一"],
        "practice": "讀這一章時，觀察「存在感」如何由自我意識作用而生，也如何在止息中退下。",
        "questions": ["沒有存在感的存在，是什麼樣的存在？"],
    },
]


def build() -> dict:
    paragraphs = read_paragraphs()
    chapters = []
    for index, chapter in enumerate(CHAPTERS, start=1):
        start, end = chapter["range"]
        quote_index = chapter["quoteIndex"]
        chapter_paragraphs = [
            paragraph
            for paragraph_index, paragraph in enumerate(paragraphs[start:end], start=start)
            if paragraph_index not in PUBLIC_EXCLUDED_PARAGRAPH_INDICES
        ]
        chapters.append(
            {
                "id": f"ch{index:02d}",
                "number": index,
                "part": chapter["part"],
                "partTitle": chapter["partTitle"],
                "title": chapter["title"],
                "subtitle": chapter["subtitle"],
                "quote": paragraphs[quote_index],
                "takeaways": chapter["takeaways"],
                "practice": chapter["practice"],
                "questions": chapter["questions"],
                "paragraphs": chapter_paragraphs,
            }
        )

    parts = []
    seen = set()
    for chapter in chapters:
        key = (chapter["part"], chapter["partTitle"])
        if key not in seen:
            seen.add(key)
            parts.append({"id": chapter["part"], "title": chapter["partTitle"]})

    return {
        "title": "靜心觀呼吸",
        "sourceTitle": paragraphs[0],
        "updated": "依 2020 更正文檔整理",
        "stats": {
            "parts": len(parts),
            "chapters": len(chapters),
            "paragraphs": sum(len(chapter["paragraphs"]) for chapter in chapters),
            "days": "100",
        },
        "parts": parts,
        "chapters": chapters,
    }


def main() -> None:
    payload = json.dumps(build(), ensure_ascii=False, indent=2)
    OUT.write_text("window.BREATH_CONTENT = " + payload + ";\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
