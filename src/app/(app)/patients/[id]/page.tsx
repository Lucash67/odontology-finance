import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePatientAction } from "@/app/actions/catalog";
import { Badge, Button, Card, Field, Flash, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatCurrency, toNumber } from "@/lib/utils";
import { treatmentStatusLabel, statusTone } from "@/lib/labels";

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      treatments: {
        include: { dentist: true, paymentPlan: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!patient) notFound();

  const action = updatePatientAction.bind(null, patient.id);

  return (
    <div>
      <PageHeader
        title={patient.fullName}
        description="Detalhe do paciente e tratamentos vinculados."
        actions={
          <Link href={`/treatments/new?patientId=${patient.id}`}>
            <Button type="button">Novo tratamento</Button>
          </Link>
        }
      />
      <Flash message={sp.ok} />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <form action={action} className="space-y-3">
            <Field label="Nome">
              <Input name="fullName" defaultValue={patient.fullName} required />
            </Field>
            <Field label="CPF">
              <Input name="document" defaultValue={patient.document || ""} />
            </Field>
            <Field label="Telefone">
              <Input name="phone" defaultValue={patient.phone || ""} />
            </Field>
            <Field label="WhatsApp">
              <Input name="whatsapp" defaultValue={patient.whatsapp || ""} />
            </Field>
            <Field label="E-mail">
              <Input name="email" defaultValue={patient.email || ""} />
            </Field>
            <Field label="Ativo">
              <Select name="active" defaultValue={patient.active ? "true" : "false"}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Select>
            </Field>
            <Field label="Observações">
              <Textarea name="notes" rows={3} defaultValue={patient.notes || ""} />
            </Field>
            <Button type="submit">Atualizar</Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-[18px] font-semibold tracking-tight">Tratamentos</h2>
          <div className="space-y-3">
            {patient.treatments.map((t) => (
              <Link
                key={t.id}
                href={`/treatments/${t.id}`}
                className="block rounded-xl border border-[var(--line)] px-3 py-3 hover:bg-black/[0.02]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{t.description}</p>
                    <p className="text-xs text-[var(--muted)]">{t.dentist.fullName}</p>
                  </div>
                  <Badge tone={statusTone(t.status)}>{treatmentStatusLabel[t.status]}</Badge>
                </div>
                <p className="mt-2 text-sm">{formatCurrency(toNumber(t.contractedAmount))}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
