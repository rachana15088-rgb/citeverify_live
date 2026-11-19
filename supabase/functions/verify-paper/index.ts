import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { document_id, file_url, raw_text } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const geminiKey = Deno.env.get("GEMINI_API_KEY")!;

    let paperContent = raw_text || "";
    if (!paperContent && file_url) {
      const fileRes = await fetch(file_url);
      paperContent = await fileRes.text();
    }

    // Single fast Gemini call to extract claims, match citations, and evaluate verdicts
    const prompt = `
      Analyze this academic text. Extract up to 5 factual claims that cite a reference, match each to its reference in the reference list, and evaluate whether the claim is accurate and well-supported.
      Return ONLY a valid JSON array of objects with these exact keys:
      - "claim_text": exact statement from the document
      - "citation_text": in-text citation e.g. "[1]"
      - "matched_reference": full reference title, author, and year
      - "evidence_passage": relevant finding or context from the cited work
      - "verdict": one of "Supported", "Partly Supported", "Unsupported", "Contradictory", or "Outdated"
      - "explanation": clear 1-2 sentence explanation of the verdict
      - "confidence_score": number between 0.0 and 1.0
      - "needs_human_review": boolean

      Text:
      ${paperContent.slice(0, 12000)}
    `;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      throw new Error(geminiData.error?.message || "Gemini API error");
    }

    const claims = JSON.parse(
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
    );

    // Fetch real CrossRef source links in parallel (with a 2-second timeout so it never hangs)
    const verificationResults = await Promise.all(
      claims.map(async (item: any) => {
        let sourceUrl = "";
        try {
          if (item.matched_reference) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            const crRes = await fetch(
              `https://api.crossref.org/works?query=${encodeURIComponent(item.matched_reference)}&rows=1`,
              { signal: controller.signal }
            );
            clearTimeout(timeout);
            const crData = await crRes.json();
            sourceUrl = crData.message?.items?.[0]?.URL || "";
          }
        } catch (_) {
          // Ignore CrossRef timeout so function finishes fast
        }

        return {
          document_id,
          claim_text: item.claim_text,
          citation_text: item.citation_text,
          matched_reference: item.matched_reference,
          source_url: sourceUrl,
          evidence_passage: item.evidence_passage,
          verdict: item.verdict || "Supported",
          explanation: item.explanation,
          confidence_score: item.confidence_score ?? 0.85,
          needs_human_review: item.needs_human_review ?? false,
        };
      })
    );

    if (verificationResults.length > 0 && document_id) {
      await supabase.from("claim_verifications").insert(verificationResults);
    }

    if (document_id) {
      await supabase
        .from("documents")
        .update({ status: "completed" })
        .eq("id", document_id);
    }

    return new Response(
      JSON.stringify({ success: true, results: verificationResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
