import { prisma } from "@/lib/prisma";
import { createTreatmentAction } from "@/app/actions/treatments";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";

export default async function NewTreatmentPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const params = await searchParams;
  const [patients, dentists] = await Promise.all([
    prisma.patient.findMany({ where: { active: true }, orderBy: { fullName: "asc" } }),
    prisma.dentist.findMany({ where: { active: true }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Novo tratamento" description="Informe paciente, dentista e valor contratado." />
      <Card className="max-w-2xl">
        <form action={createTreatmentAction} className="space-y-3">
          <Field label="Paciente">
            <Select name="patientId" required defaultValue={params.patientId || ""}>
              <option value="" disabled>
                Selecione
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Dentista">
            <Select name="dentistId" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Descrição do tratamento">
            <Input name="description" required placeholder="Ex.: Implante unitário" />
          </Field>
          <Field label="Valor total">
            <Input name="contractedAmount" type="number" step="0.01" min="0" required />
          </Field>
          <Field label="Data do orçamento">
            <Input name="budgetDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Observações">
            <Textarea name="notes" rows={3} />
          </Field>
          <Button type="submit">Salvar tratamento</Button>
        </form>
      </Card>
    </div>
  );
}
