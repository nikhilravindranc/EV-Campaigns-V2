import type { Metadata } from "next";
import { SurveysView } from "@/components/surveys/surveys-view";

export const metadata: Metadata = { title: "Surveys" };

export default function SurveysPage() {
  return <SurveysView />;
}
